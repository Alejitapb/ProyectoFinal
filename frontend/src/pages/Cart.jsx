import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/common/Container';
import ShoppingCart from '../components/cart/ShoppingCart';
import OrderSummary from '../components/cart/OrderSummary';
import { ShoppingBag, ArrowLeft, User } from 'lucide-react';

const Cart = () => {
    const { cartItems, getCartTotal, getCartCount } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            navigate('/auth?redirect=/checkout');
            return;
        }
        navigate('/checkout');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="min-h-screen bg-gray-light">
            <Container>
                <div className="py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/menu')}
                                className="flex items-center gap-2 text-gray-dark hover:text-primary-orange transition-colors"
                            >
                                <ArrowLeft size={20} />
                                Seguir Comprando
                            </button>
                            <h1 className="text-3xl font-bold text-gray-dark">
                                Carrito de Compras
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 text-gray-medium">
                            <ShoppingBag size={20} />
                            <span>{getCartCount()} artículo{getCartCount() !== 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    {cartItems.length === 0 ? (
                        /* Empty Cart */
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <ShoppingBag size={64} className="text-gray-light mx-auto mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-dark mb-4">
                                Tu carrito está vacío
                            </h2>
                            <p className="text-gray-medium mb-8">
                                ¡Agrega algunos deliciosos productos para empezar!
                            </p>
                            <Link
                                to="/menu"
                                className="inline-flex items-center gap-2 bg-primary-orange text-white px-8 py-3 rounded-lg hover:bg-primary-red transition-colors font-semibold"
                            >
                                <ShoppingBag size={20} />
                                Ver Menú
                            </Link>
                        </div>
                    ) : (
                        /* Cart with Items */
                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Cart Items */}
                            <div className="lg:col-span-2">
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-semibold text-gray-dark mb-6">
                                        Productos en tu carrito
                                    </h2>
                                    <ShoppingCart />
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                                    <h2 className="text-xl font-semibold text-gray-dark mb-6">
                                        Resumen del pedido
                                    </h2>
                                    <OrderSummary />

                                    {!user && (
                                        <div className="mb-4 p-4 bg-secondary-yellow rounded-lg border border-primary-yellow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <User size={20} className="text-primary-orange" />
                                                <span className="font-semibold text-gray-dark">
                          Inicia sesión para continuar
                        </span>
                                            </div>
                                            <p className="text-sm text-gray-medium mb-3">
                                                Necesitas una cuenta para realizar tu pedido
                                            </p>
                                            <Link
                                                to="/auth?redirect=/checkout"
                                                className="w-full block text-center bg-primary-orange text-white py-2 rounded-lg hover:bg-primary-red transition-colors font-semibold"
                                            >
                                                Iniciar Sesión
                                            </Link>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleCheckout}
                                        disabled={!user}
                                        className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                            user
                                                ? 'bg-primary-red text-white hover:bg-accent-red'
                                                : 'bg-gray-light text-gray-medium cursor-not-allowed'
                                        }`}
                                    >
                                        Proceder al Checkout
                                    </button>

                                    <div className="mt-4 text-center">
                                        <p className="text-sm text-gray-medium">
                                            Total: <span className="font-semibold text-primary-red">
                        {formatPrice(getCartTotal())}
                      </span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delivery Info */}
                    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-dark mb-4">
                            Información de Entrega
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-dark mb-2">
                                    Tiempo de entrega
                                </h4>
                                <p className="text-gray-medium">30-45 minutos</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-dark mb-2">
                                    Costo de domicilio
                                </h4>
                                <p className="text-gray-medium">
                                    {formatPrice(3000)} (Gratis en pedidos superiores a {formatPrice(50000)})
                                </p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-dark mb-2">
                                    Área de cobertura
                                </h4>
                                <p className="text-gray-medium">Sabanalarga y alrededores</p>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-dark mb-2">
                                    Métodos de pago
                                </h4>
                                <p className="text-gray-medium">Efectivo, Tarjeta, Transferencia</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Cart;