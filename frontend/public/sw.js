// frontend/public/sw.js
self.addEventListener('install', event => {
    console.log('Service Worker instalado');
});

self.addEventListener('fetch', event => {
    // Aquí podrías manejar peticiones de red si deseas
});
