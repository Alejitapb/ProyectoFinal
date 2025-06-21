import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/common/Container';
import CheckoutForm from '../components/cart/CheckoutForm';
import PaymentMethods from '../components/cart/PaymentMethods';
import OrderSummary from '../components/cart/OrderSummary';
import { ArrowLeft, Lock, MapPin, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, getCartTotal, getCartCount, clearCart } = useCart();
    const { user } = useAuth();

    const [currentStep, setCurrentStep] = useState(1);
    const [orderData, setOrderData] = useState({
        deliveryAddress: '',
        deliveryPhone: '',
        paymentMethod: 'cash',
        specialInstructions: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/auth?redirect=/checkout');
            return;
        }

        if (cartItems.length === 0) {
            navigate('/cart');
            return;
        }
    }, [user, cartItems, navigate]);

    const steps = [
        { id: 1, name: 'Información de Entrega', icon: MapPin },
        { id: 2, name: 'Método de Pago', icon: CreditCard },
        { id: 3, name: 'Confirmación', icon: Lock },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const calculateDeliveryFee = () => {
        const subtotal = getCartTotal();
        return subtotal >= 50000 ? 0 : 3000;
    };

    const calculateTax = () => {
        return Math.round(getCartTotal() * 0.08); // 8% tax
    };

    const calculateTotal = () => {
        return getCartTotal() + calculateDeliveryFee() + calculateTax();
    };

    const handleFormSubmit = (formData) => {
        setOrderData({ ...orderData, ...formData });
        setCurrentStep(2);
    };

    const handlePaymentMethodSelect = (method) => {
        setOrderData({ ...orderData, paymentMethod: method });
        setCurrentStep(3);
    };

    const handlePlaceOrder = async () => {
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            const orderNumber = `CP${Date.now()}`;

            // Clear cart and redirect to confirmation
            clearCart();
            navigate('/order-confirmation', {
                state: {
                    orderNumber,
                    orderData: {
                        ...orderData,
                        items: cartItems,
                        subtotal: getCartTotal(),
                        deliveryFee: calculateDeliveryFee(),
                        tax: calculateTax(),
                        total: calculateTotal(),
                    }
                }
            });

            toast.success('¡Pedido realizado con éxito!');
        } catch (error) {
            toast.error('Error al procesar el pedido. Intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const StepIndicator = () => (
        <div className="mb-8">
            <div className="flex items-center justify-center">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            currentStep >= step.id
                                ? 'bg-primary-orange border-primary-orange text-white'
                                : 'bg-white border-gray-medium text-gray-medium'
                        }`}>
                            <step.icon size={20} />
                        </div>
                        <div className="ml-2 hidden sm:block">
                            <p className={`text-sm font-medium ${
                                currentStep >= step.id ? 'text-primary-orange' : 'text-gray-medium'
                            }`}>
                                {step.name}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 mx-4 ${
                                currentStep > step.id ? 'bg-primary-orange' : 'bg-gray-light'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    if (!user || cartItems.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-light">
            <Container>
                <div className="py-8">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-8">
                        <button
                            onClick={() => navigate('/cart')}
                            className="flex items-center gap-2 text-gray-dark hover:text-primary-orange transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Volver al Carrito
                        </button>
                        <h1 className="text-3xl font-bold text-gray-dark">
                            Finalizar Pedido
                        </h1>
                    </div>

                    <StepIndicator />

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                {currentStep === 1 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <MapPin className="text-primary-orange" size={24} />
                                            <h2 className="text-xl font-semibold text-gray-dark">
                                                Información de Entrega
                                            </h2>
                                        </div>
                                        <CheckoutForm
                                            initialData={orderData}
                                            onSubmit={handleFormSubmit}
                                        />
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <CreditCard className="text-primary-orange" size={24} />
                                            <h2 className="text-xl font-semibold text-gray-dark">
                                                Método de Pago
                                            </h2>
                                        </div>
                                        <PaymentMethods
                                            selectedMethod={orderData.paymentMethod}
                                            onMethodSelect={handlePaymentMethodSelect}
                                        />
                                        <div className="mt-6 flex gap-4">
                                            <button
                                                onClick={() => setCurrentStep(1)}
                                                className="px-6 py-2 border border-gray-medium text-gray-dark rounded-lg hover:bg-gray-light transition-colors"
                                            >
                                                Anterior
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Lock className="text-primary-orange" size={24} />
                                            <h2 className="text-xl font-semibold text-gray-dark">
                                                Confirmar Pedido
                                            </h2>
                                        </div>

                                        {/* Order Review */}
                                        <div className="space-y-6">
                                            {/* Delivery Info */}
                                            <div className="border border-gray-light rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-dark mb-3">
                                                    Información de Entrega
                                                </h3>
                                                <div className="space-y-2 text-sm">
                                                    <p><strong>Dirección:</strong> {orderData.deliveryAddress}</p>
                                                    <p><strong>Teléfono:</strong> {orderData.deliveryPhone}</p>
                                                    {orderData.specialInstructions && (
                                                        <p><strong>Instrucciones:</strong> {orderData.specialInstructions}</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div className="border border-gray-light rounded-lg p-4">
                                                <h3 className="font-semibold text-gray-dark mb-3">
                                                    Método de Pago
                                                </h3>
                                                <p className="text-sm">
                                                    {orderData.paymentMethod === 'cash' && 'Efectivo al momento de la entrega'}
                                                    {orderData.paymentMethod === 'card' && 'Tarjeta de crédito/débito'}
                                                    {orderData.paymentMethod === 'transfer' && 'Transferencia bancaria'}
                                                </p>
                                            </div>

                                            {/* Estimated Delivery */}
                                            <div className="border border-gray-light rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="text-primary-orange" size={20} />
                                                    <h3 className="font-semibold text-gray-dark">
                                                        Tiempo Estimado de Entrega
                                                    </h3>
                                                </div>
                                                <p className="text-sm text-gray-medium">
                                                    30-45 minutos desde la confirmación del pedido
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex gap-4">
                                            <button
                                                onClick={() => setCurrentStep(2)}
                                                className="px-6 py-2 border border-gray-medium text-gray-dark rounded-lg hover:bg-gray-light transition-colors"
                                            >
                                                Anterior
                                            </button>
                                            <button
                                                onClick={handlePlaceOrder}
                                                disabled={isSubmitting}
                                                className="flex-1 bg-primary-red text-white py-3 rounded-lg font-semibold hover:bg-accent-red transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                                <h2 className="text-xl font-semibold text-gray-dark mb-6">
                                    Resumen del Pedido
                                </h2>

                                {/* Cart Items */}
                                <div className="space-y-3 mb-6">
                                    {cartItems.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                      <span className="flex-1">
                        {item.quantity}x {item.name}
                      </span>
                                            <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div className="border-t border-gray-light pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(getCartTotal())}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Domicilio</span>
                                        <span>
                      {calculateDeliveryFee() === 0 ? 'Gratis' : formatPrice(calculateDeliveryFee())}
                    </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Impuestos</span>
                                        <span>{formatPrice(calculateTax())}</span>
                                    </div>
                                    <div className="border-t border-gray-light pt-2 flex justify-between font-semibold">
                                        <span>Total</span>
                                        <span className="text-primary-red">
                      {formatPrice(calculateTotal())}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-6 text-center">
                                    <p className="text-xs text-gray-medium">
                                        Al confirmar tu pedido aceptas nuestros términos y condiciones
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
};

export default Checkout;