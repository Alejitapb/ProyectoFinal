import React, { useState } from 'react';
import {
    Star,
    Clock,
    Plus,
    Minus,
    ShoppingCart,
    Heart,
    Info,
    ChefHat,
    Utensils
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';
import StarRating from '../reviews/StarRating';
import toast from 'react-hot-toast';

const ProductDetail = ({ product, onClose, reviews = [] }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [quantity, setQuantity] = useState(1);
    const [specialRequests, setSpecialRequests] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState('description');

    if (!product) return null;

    const handleAddToCart = () => {
        const cartItem = {
            ...product,
            quantity,
            special_requests: specialRequests
        };

        addToCart(cartItem);
        toast.success(`${product.name} agregado al carrito`);
    };

    const handleQuantityChange = (type) => {
        if (type === 'increase') {
            setQuantity(prev => prev + 1);
        } else if (type === 'decrease' && quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
    };

    const productReviews = reviews.filter(review => review.product_id === product.id);
    const averageRating = productReviews.length > 0
        ? productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length
        : 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800">Detalles del Producto</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Imagen del producto */}
                        <div className="space-y-4">
                            <div className="relative">
                                <img
                                    src={product.image_url || '/images/placeholder-food.jpg'}
                                    alt={product.name}
                                    className="w-full h-80 object-cover rounded-xl"
                                />
                                <button
                                    onClick={toggleFavorite}
                                    className={`absolute top-4 right-4 p-2 rounded-full ${
                                        isFavorite
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white text-gray-600 hover:text-red-500'
                                    } transition-colors shadow-lg`}
                                >
                                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                </button>

                                {!product.is_available && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                      No Disponible
                    </span>
                                    </div>
                                )}
                            </div>

                            {/* Información adicional móvil */}
                            <div className="lg:hidden">
                                <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h1>
                                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-primary-orange">
                    {formatPrice(product.price)}
                  </span>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={averageRating} size="sm" />
                                        <span className="text-sm text-gray-600">
                      ({productReviews.length} reseñas)
                    </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información del producto */}
                        <div className="space-y-6">
                            {/* Título y precio - Desktop */}
                            <div className="hidden lg:block">
                                <h1 className="text-3xl font-bold text-gray-800 mb-4">{product.name}</h1>
                                <div className="flex items-center justify-between mb-4">
                  <span className="text-4xl font-bold text-primary-orange">
                    {formatPrice(product.price)}
                  </span>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={averageRating} />
                                        <span className="text-gray-600">
                      ({productReviews.length} reseñas)
                    </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información rápida */}
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm">{product.preparation_time || 15} min</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <ChefHat className="w-4 h-4" />
                                    <span className="text-sm">Recién preparado</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Utensils className="w-4 h-4" />
                                    <span className="text-sm">Especialidad de la casa</span>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="flex space-x-8">
                                    {[
                                        { id: 'description', label: 'Descripción', icon: Info },
                                        { id: 'ingredients', label: 'Ingredientes', icon: Utensils },
                                        { id: 'nutrition', label: 'Nutrición', icon: ChefHat }
                                    ].map(({ id, label, icon: Icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveTab(id)}
                                            className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm ${
                                                activeTab === id
                                                    ? 'border-primary-orange text-primary-orange'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <Icon className="w-4 h-4" />
                                            {label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Contenido de tabs */}
                            <div className="min-h-[120px]">
                                {activeTab === 'description' && (
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {product.description || 'Delicioso plato preparado con los mejores ingredientes y el sazón tradicional de la costa caribeña.'}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'ingredients' && (
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {product.ingredients || 'Ingredientes frescos seleccionados cuidadosamente para garantizar el mejor sabor y calidad.'}
                                        </p>
                                    </div>
                                )}

                                {activeTab === 'nutrition' && (
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {product.nutritional_info || 'Información nutricional disponible bajo solicitud. Nuestros platos son preparados con ingredientes frescos y naturales.'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Instrucciones especiales */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Instrucciones especiales (opcional)
                                </label>
                                <textarea
                                    value={specialRequests}
                                    onChange={(e) => setSpecialRequests(e.target.value)}
                                    placeholder="Ej: Sin cebolla, extra picante, etc."
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                                    rows="3"
                                />
                            </div>

                            {/* Controles de cantidad y agregar al carrito */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-medium text-gray-700">Cantidad:</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleQuantityChange('decrease')}
                                            disabled={quantity <= 1}
                                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange('increase')}
                                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-lg font-semibold">
                                    <span>Total:</span>
                                    <span className="text-primary-orange">
                    {formatPrice(product.price * quantity)}
                  </span>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.is_available}
                                    className="w-full bg-primary-orange text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {product.is_available ? 'Agregar al Carrito' : 'No Disponible'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;