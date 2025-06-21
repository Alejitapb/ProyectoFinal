# 🍗 Cali Pollo Delivery - Sistema de Pedidos Web

¡Bienvenido al repositorio oficial del sistema de pedidos en línea **Cali Pollo Delivery**! 🚀  
Una aplicación moderna desarrollada con **React + Vite** en el frontend y **Node.js + Express** en el backend, enfocada en comida típica colombiana. 🇨🇴

---

## 🧰 Stack Tecnológico

### 🔹 Frontend
- ⚛️ React 18 + Vite
- 🎨 CSS personalizado con paleta de colores: Amarillo, Naranja y Rojo
- 🌐 React Router DOM
- 🔐 OAuth con [`jwt-decode v3.1.2`](https://cdnjs.cloudflare.com/ajax/libs/jwt-decode/3.1.2/jwt-decode.min.js)
- 📦 Axios para peticiones HTTP

### 🔹 Backend
- 🖥️ Node.js + Express
- 🔐 JWT + Passport (Google y Facebook)
- 🧂 bcryptjs para hashing de contraseñas
- 🛡️ Helmet, CORS y Rate Limiting
- 📁 Multer (carga de archivos)

### 🔹 Base de Datos
- 🗄️ MySQL / MariaDB
- ⚙️ Script SQL ubicado en `database/schema.sql`

### 🖼️ Recursos gráficos

- 📍 Logo: `frontend/public/images/logo-cali-pollo.png`
- 🖼️ Imágenes de platillos: se cargan desde URLs externas

### 📦 Instalación del proyecto

1. 🧬 Clona el repositorio:  
  git clone https://github.com/tu-usuario/cali-pollo-delivery.git  
  cd cali-pollo-delivery

### ✨ Funcionalidades clave

- 🔐 Login/Registro con OAuth y tradicional
- 🍽️ Menú de productos dinámico
- 🛒 Carrito de compras persistente
- 📦 Gestión de pedidos por estados
- ⭐ Reseñas y calificaciones
- 📊 Panel administrativo (inventario, reportes, productos)
- 🆘 Sistema de soporte técnico
- 📱 Diseño responsive
- 🌐 Funcionalidad offline básica

---

### 🎨 Paleta de Colores

| Color        | Hex        | Uso principal                  |
|--------------|------------|-------------------------------|
| 🟡 Amarillo   | `#FFD700`  | Elementos destacados           |
| 🟠 Naranja    | `#FF8C00`  | Botones principales            |
| 🔴 Rojo       | `#FF4500`  | Alertas y elementos críticos   |

---

## 🧑‍💻 Autora

👩‍💻 **Alejandra Pabón Barbosa**  
📧 Contacto: pabonalejandra8@gmail.com  
🔗 Proyecto académico **SENA - Ficha 2885494**

---

### 📝 Licencia

Este proyecto está licenciado bajo **MIT License**.  
Uso libre con fines académicos, personales o empresariales. 🍽️


---

### 📁 Estructura del Proyecto

```plaintext
cali-pollo-delivery/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │       └── logo-cali-pollo.png
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   └── schema.sql
├── .env
├── README.md
└── package.json