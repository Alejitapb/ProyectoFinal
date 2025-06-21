import React, { useState } from 'react';
import { User, Phone, MapPin, CreditCard, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const CheckoutForm = ({ onSubmit, loading = false }) => {
    const { user } = useAuth();
    const { cartItems, getTotalPrice } = useCart();

    const [formData, setFormData] = useState({
        delivery_address: user?.address || '',
        delivery_phone: user?.phone || '',
        payment_method: 'cash',
        special_instructions: ''
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.delivery_address.trim()) {
            newErrors.delivery_address = 'La dirección de entrega es obligatoria';
        }

        if (!formData.delivery_phone.trim()) {
            newErrors.delivery_phone = 'El teléfono es obligatorio';
        } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.delivery_phone)) {
            newErrors.delivery_phone = 'Ingresa un número de teléfono válido';
        }

        if (!formData.payment_method) {
            newErrors.payment_method = 'Selecciona un método de pago';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const deliveryFee = 3000;
    const subtotal = getTotalPrice();
    const total = subtotal + deliveryFee;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <CreditCard className="mr-2 text-yellow-500" />
                Finalizar Pedido
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información de entrega */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Información de Entrega
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="inline w-4 h-4 mr-1" />
                            Dirección de Entrega *
                        </label>
                        <textarea
                            name="delivery_address"
                            value={formData.delivery_address}
                            onChange={handleChange}
                            placeholder="Ingresa tu dirección completa..."
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                                errors.delivery_address ? 'border-red-500' : 'border-gray-300'
                            }`}
                            rows="3"
                        />
                        {errors.delivery_address && (
                            <p className="text-red-500 text-sm mt-1">{errors.delivery_address}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Phone className="inline w-4 h-4 mr-1" />
                            Teléfono de Contacto *
                        </label>
                        <input
                            type="tel"
                            name="delivery_phone"
                            value={formData.delivery_phone}
                            onChange={handleChange}
                            placeholder="Ejemplo: +57 300 123 4567"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                                errors.delivery_phone ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.delivery_phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.delivery_phone}</p>
                        )}
                    </div>
                </div>

                {/* Método de pago */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                        Método de Pago
                    </h3>

                    <div className="space-y-3">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="payment_method"
                                value="cash"
                                checked={formData.payment_method === 'cash'}
                                onChange={handleChange}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">Efectivo</div>
                                <div className="text-sm text-gray-500">Pago contra entrega</div>
                            </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="payment_method"
                                value="card"
                                checked={formData.payment_method === 'card'}
                                onChange={handleChange}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">Tarjeta de Crédito/Débito</div>
                                <div className="text-sm text-gray-500">Visa, MasterCard, American Express</div>
                            </div>
                        </label>

                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="radio"
                                name="payment_method"
                                value="transfer"
                                checked={formData.payment_method === 'transfer'}
                                onChange={handleChange}
                                className="mr-3"
                            />
                            <div>
                                <div className="font-medium">Transferencia Bancaria</div>
                                <div className="text-sm text-gray-500">Nequi, Daviplata, Bancolombia</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Instrucciones especiales */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="inline w-4 h-4 mr-1" />
                        Instrucciones Especiales (Opcional)
                    </label>
                    <textarea
                        name="special_instructions"
                        value={formData.special_instructions}
                        onChange={handleChange}
                        placeholder="Ejemplo: Sin cebolla, punto de referencia, etc."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        rows="3"
                    />
                </div>

                {/* Resumen del pedido */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-3">Resumen del Pedido</h3>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal ({cartItems.length} items):</span>
                            <span>${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Costo de entrega:</span>
                            <span>${deliveryFee.toLocaleString()}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span className="text-yellow-600">${total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Tiempo estimado */}
                <div className="bg-yellow-50 p-4 rounded-lg flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                        <div className="font-medium text-yellow-800">Tiempo estimado de entrega</div>
                        <div className="text-sm text-yellow-600">30-45 minutos</div>
                    </div>
                </div>

                {/* Botón de envío */}
                <button
                    type="submit"
                    disabled={loading || cartItems.length === 0}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                        <CreditCard className="w-5 h-5 mr-2" />
                    )}
                    {loading ? 'Procesando...' : `Confirmar Pedido - $${total.toLocaleString()}`}
                </button>
            </form>
        </div>
    );
};

export default CheckoutForm;