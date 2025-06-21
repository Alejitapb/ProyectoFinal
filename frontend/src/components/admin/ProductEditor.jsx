import { useState, useEffect } from 'react';
import { Save, Upload, X, Plus, Trash2 } from 'lucide-react';
import { productsService } from '../../services/products';
import { toast } from 'react-hot-toast';

const ProductEditor = ({ productId, onClose, onSave }) => {
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        image_url: '',
        ingredients: '',
        nutritional_info: '',
        preparation_time: 15,
        is_available: true,
        stock_quantity: 0
    });
    const [categories, setCategories] = useState([]);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [ingredients, setIngredients] = useState(['']);

    useEffect(() => {
        loadCategories();
        if (productId) {
            loadProduct();
        }
    }, [productId]);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadProduct = async () => {
        try {
            const data = await productService.getProduct(productId);
            setProduct(data);
            if (data.ingredients) {
                setIngredients(data.ingredients.split(',').map(ing => ing.trim()));
            }
        } catch (error) {
            console.error('Error loading product:', error);
            toast.error('Error al cargar el producto');
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setProduct(prev => ({
                    ...prev,
                    image_url: e.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIngredientChange = (index, value) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = value;
        setIngredients(newIngredients);
    };

    const addIngredient = () => {
        setIngredients([...ingredients, '']);
    };

    const removeIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            const productData = {
                ...product,
                ingredients: ingredients.filter(ing => ing.trim()).join(', '),
                price: parseFloat(product.price),
                preparation_time: parseInt(product.preparation_time),
                stock_quantity: parseInt(product.stock_quantity)
            };

            Object.keys(productData).forEach(key => {
                formData.append(key, productData[key]);
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            let result;
            if (productId) {
                result = await productService.updateProduct(productId, formData);
                toast.success('Producto actualizado exitosamente');
            } else {
                result = await productService.createProduct(formData);
                toast.success('Producto creado exitosamente');
            }

            onSave(result);
            onClose();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error('Error al guardar el producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {productId ? 'Editar Producto' : 'Crear Producto'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre del Producto
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={product.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                placeholder="Ej: Pollo Frito Especial"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Categoría
                            </label>
                            <select
                                name="category_id"
                                value={product.category_id}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            >
                                <option value="">Seleccionar categoría</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción
                        </label>
                        <textarea
                            name="description"
                            value={product.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            placeholder="Descripción del producto..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Precio ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={product.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="100"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiempo de Preparación (min)
                            </label>
                            <input
                                type="number"
                                name="preparation_time"
                                value={product.preparation_time}
                                onChange={handleInputChange}
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Stock
                            </label>
                            <input
                                type="number"
                                name="stock_quantity"
                                value={product.stock_quantity}
                                onChange={handleInputChange}
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen del Producto
                        </label>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200">
                                <Upload className="w-4 h-4 mr-2" />
                                Subir Imagen
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            {product.image_url && (
                                <div className="relative">
                                    <img
                                        src={product.image_url}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Ingredientes
                            </label>
                            <button
                                type="button"
                                onClick={addIngredient}
                                className="flex items-center text-primary-orange hover:text-primary-red"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {ingredients.map((ingredient, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={ingredient}
                                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                        placeholder="Ingrediente..."
                                    />
                                    {ingredients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Información Nutricional
                        </label>
                        <textarea
                            name="nutritional_info"
                            value={product.nutritional_info}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            placeholder="Información nutricional..."
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="is_available"
                            checked={product.is_available}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-primary-orange focus:ring-primary-orange border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                            Producto disponible
                        </label>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-primary-orange text-white rounded-md hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {productId ? 'Actualizar' : 'Crear'} Producto
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductEditor;