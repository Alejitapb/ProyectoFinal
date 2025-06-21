import React, { useState } from 'react';
import {
    ShoppingCart as CartIcon,
    X,
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    ShoppingBag
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/helpers';
import CartItem from './CartItem';
import OrderSummary from './OrderSummary';
import toast from 'react-hot-toast';

const ShoppingCart = ({ isOpen = false, onClose = () => {}, onCheckout = () => {} }) => {
    const { user } = useAuth();
    const {
        cartItems,
        updateCartItem,
        removeFromCart,
        clearCart,
        getCartSubtotal,
        getCartTotal,
        getCartItemsCount
    } = useCart();

    const [isClearing, setIsClearing] = useState(false);

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            handleRemoveItem(itemId);
            return;
        }
        updateCartItem(itemId, { quantity: newQuantity });
    };

    const handleRemoveItem = (itemId) => {
        removeFromCart(itemId);
        toast.success('Producto eliminado del carrito');
    };

    const handleClearCart = async () => {
        setIsClearing(true);
        try {
            await clearCart();
            toast.success('Carrito vaciado');
        } catch (error) {
            toast.error('Error al vaciar el carrito');
        } finally {
            setIsClearing(false);
        }
    };

    const handleCheckout = () => {
        if (!user) {
            toast.error('Inicia sesión para continuar con tu pedido');
            return;
        }

        if (cartItems.length === 0) {
            toast.error('Tu carrito está vacío');
            return;
        }

        onCheckout();
    };

    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    const itemsCount = getCartItemsCount();

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
            />

            {/* Cart Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <CartIcon className="w-6 h-6 text-primary-orange" />
                        <h2 className="text-xl font-bold text-gray-800">
                            Mi Carrito ({itemsCount})
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Cart Content */}
                <div className="flex flex-col h-full">
                    {cartItems.length > 0 ? (
                        <>
                            {/* Items List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {cartItems.map((item) => (
                                    <CartItem
                                        key={`${item.id}-${item.cartId || Date.now()}`}
                                        item={item}
                                        onUpdateQuantity={(quantity) => handleUpdateQuantity(item.cartId || item.id, quantity)}
                                        onRemove={() => handleRemoveItem(item.cartId || item.id)}
                                    />
                                ))}
                            </div>

                            {/* Clear Cart Button */}
                            <div className="px-4 pb-2">
                                <button
                                    onClick={handleClearCart}
                                    disabled={isClearing}
                                    className="w-full text-red-600 hover:text-red-700 text-sm font-medium py-2 flex items-center justify-center gap-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {isClearing ? 'Vaciando...' : 'Vaciar carrito'}
                                </button>
                            </div>

                            {/* Order Summary */}
                            <div className="border-t border-gray-200 p-4 bg-gray-50">
                                <OrderSummary
                                    subtotal={subtotal}
                                    total={total}
                                    itemsCount={itemsCount}
                                    showDetails={false}
                                />
                            </div>

                            {/* Checkout Button */}
                            <div className="p-4 bg-white border-t border-gray-200">
                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-primary-orange text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors"
                                >
                                    <span>Proceder al Checkout</span>
                                    <ArrowRight className="w-5 h-5" />
                                </button>

                                {!user && (
                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        Inicia sesión para continuar con tu pedido
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        /* Empty Cart */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <ShoppingBag className="w-12 h-12 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                Tu carrito está vacío
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Agrega algunos deliciosos productos para empezar tu pedido
                            </p>
                            <button
                                onClick={onClose}
                                className="bg-primary-orange text-white px-8 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-colors"
                            >
                                Explorar Menú
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ShoppingCart;