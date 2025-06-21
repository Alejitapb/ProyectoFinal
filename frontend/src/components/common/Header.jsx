import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Menu,
    X,
    ShoppingCart,
    User,
    Search,
    Phone,
    LogOut,
    Settings,
    Heart
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';


const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { user, logout } = useAuth();
    const { cartItems } = useCart();
    const navigate = useNavigate();
    const location = useLocation();

    const cartItemsCount = (cartItems || []).reduce((total, item) => total + item.quantity, 0);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const handleLogout = () => {
        logout();
        setIsProfileMenuOpen(false);
        navigate('/');
    };

    const isActivePage = (path) => {
        return location.pathname === path;
    };

    const closeModals = () => {
        setShowLoginModal(false);
        setShowRegisterModal(false);
    };

    const switchToRegister = () => {
        setShowLoginModal(false);
        setShowRegisterModal(true);
    };

    const switchToLogin = () => {
        setShowRegisterModal(false);
        setShowLoginModal(true);
    };

    return (
        <>
            <header className="bg-white shadow-lg sticky top-0 z-50">
                {/* Top Bar */}
                <div className="bg-primary-yellow py-2">
                    <div className="container mx-auto px-4 flex justify-between items-center text-sm">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <Phone size={16} />
                                <span className="font-medium">+57 300 123 4567</span>
                            </div>
                            <span className="hidden md:block">Carrera 10 #15-25, Sabanalarga, Atlántico</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span>🚚 Domicilio GRATIS desde $25.000</span>
                        </div>
                    </div>
                </div>

                {/* Main Header */}
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src="/images/logo-cali-pollo.png"
                                alt="Cali Pollo"
                                className="h-12 w-auto"
                                onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGRkQ3MDAiLz4KPHRleHQgeD0iMjQiIHk9IjI4IiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0ZGNDUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q1A8L3RleHQ+Cjwvc3ZnPgo=';
                                }}
                            />
                            <div className="hidden sm:block">
                                <h1 className="text-2xl font-bold text-primary-red">Cali Pollo</h1>
                                <p className="text-sm text-gray-600">Delivery</p>
                            </div>
                        </Link>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-8">
                            <form onSubmit={handleSearch} className="w-full relative">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pr-10 border-2 border-primary-yellow rounded-full focus:outline-none focus:border-primary-orange"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-orange hover:text-primary-red"
                                >
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>

                        {/* Navigation Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Cart */}
                            <Link
                                to="/cart"
                                className="relative p-2 text-primary-red hover:text-primary-orange transition-colors"
                            >
                                <ShoppingCart size={24} />
                                {cartItemsCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                                )}
                            </Link>

                            {/* User Menu */}
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="flex items-center space-x-2 p-2 text-primary-red hover:text-primary-orange transition-colors"
                                    >
                                        {user.avatar_url ? (
                                            <img
                                                src={user.avatar_url}
                                                alt={user.name}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <User size={24} />
                                        )}
                                        <span className="hidden md:block font-medium">{user.name}</span>
                                    </button>

                                    {/* Profile Dropdown */}
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <Link
                                                to="/profile"
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-secondary-yellow"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <User size={16} />
                                                <span>Mi Perfil</span>
                                            </Link>
                                            <Link
                                                to="/reviews"
                                                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-secondary-yellow"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <Heart size={16} />
                                                <span>Mis Reseñas</span>
                                            </Link>
                                            {user.role === 'admin' && (
                                                <Link
                                                    to="/admin"
                                                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-secondary-yellow"
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                >
                                                    <Settings size={16} />
                                                    <span>Administración</span>
                                                </Link>
                                            )}
                                            <hr className="my-2" />
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                                            >
                                                <LogOut size={16} />
                                                <span>Cerrar Sesión</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="flex items-center space-x-2 bg-primary-orange text-white px-4 py-2 rounded-full hover:bg-primary-red transition-colors font-medium"
                                >
                                    <User size={20} />
                                    <span className="hidden sm:block">Iniciar Sesión</span>
                                </button>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden text-primary-red hover:text-primary-orange"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Navigation Menu */}
                    <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:block mt-4`}>
                        <div className="flex flex-col md:flex-row md:justify-center space-y-2 md:space-y-0 md:space-x-8">
                            <Link
                                to="/"
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    isActivePage('/')
                                        ? 'bg-primary-yellow text-primary-red'
                                        : 'text-gray-700 hover:text-primary-red hover:bg-secondary-yellow'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Inicio
                            </Link>
                            <Link
                                to="/menu"
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    isActivePage('/menu')
                                        ? 'bg-primary-yellow text-primary-red'
                                        : 'text-gray-700 hover:text-primary-red hover:bg-secondary-yellow'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Menú
                            </Link>
                            <Link
                                to="/reviews"
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    isActivePage('/reviews')
                                        ? 'bg-primary-yellow text-primary-red'
                                        : 'text-gray-700 hover:text-primary-red hover:bg-secondary-yellow'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Reseñas
                            </Link>
                            <Link
                                to="/support"
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    isActivePage('/support')
                                        ? 'bg-primary-yellow text-primary-red'
                                        : 'text-gray-700 hover:text-primary-red hover:bg-secondary-yellow'
                                }`}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Soporte
                            </Link>
                        </div>

                        {/* Mobile Search */}
                        <div className="md:hidden mt-4">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-4 py-2 pr-10 border-2 border-primary-yellow rounded-full focus:outline-none focus:border-primary-orange"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-orange hover:text-primary-red"
                                >
                                    <Search size={20} />
                                </button>
                            </form>
                        </div>
                    </nav>
                </div>
            </header>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <LoginForm
                            onClose={closeModals}
                            onSwitchToRegister={switchToRegister}
                        />
                    </div>
                </div>
            )}

            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <RegisterForm
                            onClose={closeModals}
                            onSwitchToLogin={switchToLogin}
                        />
                    </div>
                </div>
            )}

            {/* Overlay to close dropdowns */}
            {isProfileMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                />
            )}
        </>
    );
};

export default Header;