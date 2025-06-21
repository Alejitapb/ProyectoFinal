const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = uploadsDir;

        // Crear subdirectorios según el tipo de archivo
        if (file.fieldname === 'product_image') {
            uploadPath = path.join(uploadsDir, 'products');
        } else if (file.fieldname === 'category_image') {
            uploadPath = path.join(uploadsDir, 'categories');
        } else if (file.fieldname === 'user_avatar') {
            uploadPath = path.join(uploadsDir, 'avatars');
        }

        // Crear directorio si no existe
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);

        // Limpiar el nombre base de caracteres especiales
        const cleanBaseName = baseName
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 20);

        cb(null, `${cleanBaseName}-${uniqueSuffix}${extension}`);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Tipos MIME permitidos para imágenes
    const allowedMimeTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten imágenes JPEG, PNG, GIF y WebP.`), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB por defecto
        files: 5 // Máximo 5 archivos por request
    }
});

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    message: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    message: 'Demasiados archivos. Máximo permitido: 5'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    message: 'Campo de archivo inesperado'
                });
            default:
                return res.status(400).json({
                    success: false,
                    message: `Error de carga: ${error.message}`
                });
        }
    }

    if (error.message.includes('Tipo de archivo no permitido')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }

    next(error);
};

// Middleware para validar archivos requeridos
const requireFile = (fieldName) => {
    return (req, res, next) => {
        if (!req.file && !req.files) {
            return res.status(400).json({
                success: false,
                message: `El archivo ${fieldName} es requerido`
            });
        }
        next();
    };
};

// Middleware para procesar la URL del archivo subido
const processFileUrl = (req, res, next) => {
    if (req.file) {
        // Construir URL relativa para el archivo
        const relativePath = req.file.path.replace(path.join(__dirname, '../'), '');
        req.file.url = `/${relativePath.replace(/\\/g, '/')}`;
    }

    if (req.files) {
        // Procesar múltiples archivos
        Object.keys(req.files).forEach(fieldName => {
            req.files[fieldName].forEach(file => {
                const relativePath = file.path.replace(path.join(__dirname, '../'), '');
                file.url = `/${relativePath.replace(/\\/g, '/')}`;
            });
        });
    }

    next();
};

// Función para eliminar archivo
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        // Convertir URL relativa a ruta absoluta
        let absolutePath = filePath;
        if (filePath.startsWith('/uploads')) {
            absolutePath = path.join(__dirname, '../', filePath);
        } else if (filePath.startsWith('uploads')) {
            absolutePath = path.join(__dirname, '../', filePath);
        }

        fs.unlink(absolutePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                reject(err);
            } else {
                console.log('File deleted successfully:', absolutePath);
                resolve();
            }
        });
    });
};

// Función para validar que el archivo existe
const fileExists = (filePath) => {
    let absolutePath = filePath;
    if (filePath.startsWith('/uploads')) {
        absolutePath = path.join(__dirname, '../', filePath);
    } else if (filePath.startsWith('uploads')) {
        absolutePath = path.join(__dirname, '../', filePath);
    }

    return fs.existsSync(absolutePath);
};

// Middleware específicos para diferentes tipos de uploads
const uploadProductImage = upload.single('product_image');
const uploadCategoryImage = upload.single('category_image');
const uploadUserAvatar = upload.single('user_avatar');
const uploadMultipleImages = upload.array('images', 5);

// Middleware para redimensionar imágenes (requiere sharp - opcional)
const resizeImage = (width, height, quality = 80) => {
    return async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            // Solo proceder si sharp está disponible
            const sharp = require('sharp');

            const outputPath = req.file.path.replace(
                path.extname(req.file.path),
                `-resized${path.extname(req.file.path)}`
            );

            await sharp(req.file.path)
                .resize(width, height, {
                    fit: 'cover',
                    position: 'center'
                })
                .jpeg({ quality })
                .toFile(outputPath);

            // Eliminar archivo original
            fs.unlinkSync(req.file.path);

            // Actualizar información del archivo
            req.file.path = outputPath;
            req.file.filename = path.basename(outputPath);

            next();
        } catch (error) {
            console.log('Sharp not available or error resizing:', error.message);
            // Continuar sin redimensionar si sharp no está disponible
            next();
        }
    };
};

// Middleware para validar dimensiones de imagen
const validateImageDimensions = (minWidth, minHeight, maxWidth, maxHeight) => {
    return async (req, res, next) => {
        if (!req.file) {
            return next();
        }

        try {
            const sharp = require('sharp');
            const metadata = await sharp(req.file.path).metadata();

            if (metadata.width < minWidth || metadata.height < minHeight) {
                // Eliminar archivo subido
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: `La imagen debe tener al menos ${minWidth}x${minHeight} píxeles`
                });
            }

            if (metadata.width > maxWidth || metadata.height > maxHeight) {
                // Eliminar archivo subido
                fs.unlinkSync(req.file.path);
                return res.status(400).json({
                    success: false,
                    message: `La imagen no debe exceder ${maxWidth}x${maxHeight} píxeles`
                });
            }

            next();
        } catch (error) {
            console.log('Sharp not available for dimension validation:', error.message);
            // Continuar sin validar dimensiones si sharp no está disponible
            next();
        }
    };
};

module.exports = {
    upload,
    uploadProductImage,
    uploadCategoryImage,
    uploadUserAvatar,
    uploadMultipleImages,
    handleMulterError,
    requireFile,
    processFileUrl,
    deleteFile,
    fileExists,
    resizeImage,
    validateImageDimensions
};