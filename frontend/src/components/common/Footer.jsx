import React from 'react';
import { Link } from 'react-router-dom';
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Facebook,
    Instagram,
    Twitter,
    Heart
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-dark text-white">
            {/* Main Footer Content */}
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img
                                src="/images/logo-cali-pollo.png"
                                alt="Cali Pollo"
                                className="h-10 w-auto"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGRkQ3MDAiLz4KPHRleHQgeD0iMjAiIHk9IjI0IiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNDUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q1A8L3RleHQ+Cjwvc3ZnPgo=';
                                }}
                            />
                            <div>
                                <h3 className="text-xl font-bold text-primary-yellow">Cali Pollo</h3>
                                <p className="text-sm text-gray-light">Delivery</p>
                            </div>
                        </div>
                        <p className="text-gray-light leading-relaxed">
                            El mejor pollo frito de la costa caribeña, directo a tu puerta.
                            Sabor auténtico y calidad garantizada en cada pedido.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-light hover:text-primary-yellow transition-colors"
                                aria-label="Síguenos en Facebook"
                            >
                                <Facebook size={24} />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-light hover:text-primary-yellow transition-colors"
                                aria-label="Síguenos en Instagram"
                            >
                                <Instagram size={24} />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-light hover:text-primary-yellow transition-colors"
                                aria-label="Síguenos en Twitter"
                            >
                                <Twitter size={24} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-primary-yellow">Enlaces Rápidos</h4>
                        <nav className="space-y-2">
                            <Link
                                to="/"
                                className="block text-gray-light hover:text-white transition-colors"
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/menu"
                                className="block text-gray-light hover:text-white transition-colors"
                            >
                                Nuestro Menú
                            </Link>
                            <Link
                                to="/reviews"
                                className="block text-gray-light hover:text-white transition-colors"
                            >
                                Reseñas
                            </Link>
                            <Link
                                to="/support"
                                className="block text-gray-light hover:text-white transition-colors"
                            >
                                Soporte
                            </Link>
                        </nav>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-primary-yellow">Contacto</h4>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <MapPin size={20} className="text-primary-orange mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-gray-light">
                                        Carrera 10 #15-25<br />
                                        Sabanalarga, Atlántico<br />
                                        Colombia
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone size={20} className="text-primary-orange flex-shrink-0" />
                                <a
                                    href="tel:+573001234567"
                                    className="text-gray-light hover:text-white transition-colors"
                                >
                                    +57 300 123 4567
                                </a>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Mail size={20} className="text-primary-orange flex-shrink-0" />
                                <a
                                    href="mailto:info@calipollo.com"
                                    className="text-gray-light hover:text-white transition-colors"
                                >
                                    info@calipollo.com
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Hours & Info */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-primary-yellow">Horarios</h4>
                        <div className="space-y-3">
                            <div className="flex items-start space-x-3">
                                <Clock size={20} className="text-primary-orange mt-0.5 flex-shrink-0" />
                                <div className="text-gray-light">
                                    <p className="font-medium">Lunes - Domingo</p>
                                    <p>11:00 AM - 10:00 PM</p>
                                </div>
                            </div>
                            <div className="bg-primary-yellow bg-opacity-10 p-3 rounded-lg">
                                <p className="text-sm text-white font-medium">
                                    🚚 Domicilio GRATIS
                                </p>
                                <p className="text-sm text-gray-light">
                                    En pedidos desde $25.000
                                </p>
                            </div>
                            <div className="bg-primary-orange bg-opacity-10 p-3 rounded-lg">
                                <p className="text-sm text-white font-medium">
                                    ⏱️ Tiempo de entrega
                                </p>
                                <p className="text-sm text-gray-light">
                                    30-45 minutos aprox.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-medium border-opacity-20"></div>

            {/* Bottom Footer */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-center md:text-left">
                        <p className="text-gray-light text-sm">
                            © {currentYear} Cali Pollo Delivery. Todos los derechos reservados.
                        </p>
                        <p className="text-gray-light text-xs mt-1">
                            Desarrollado por Alejandra Pabón Barbosa
                        </p>
                    </div>

                    <div className="flex items-center space-x-1 text-gray-light text-sm">
                        <span>Hecho con</span>
                        <Heart size={16} className="text-accent-red" />
                        <span>para la comunidad de Sabanalarga</span>
                    </div>
                </div>

                {/* Additional Links */}
                <div className="mt-4 pt-4 border-t border-gray-medium border-opacity-20">
                    <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-xs text-gray-light">
                        <a href="/privacy" className="hover:text-white transition-colors">
                            Política de Privacidad
                        </a>
                        <a href="/terms" className="hover:text-white transition-colors">
                            Términos y Condiciones
                        </a>
                        <a href="/cookies" className="hover:text-white transition-colors">
                            Política de Cookies
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;