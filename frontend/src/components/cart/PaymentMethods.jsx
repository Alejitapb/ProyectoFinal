import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

const PaymentMethods = ({ selectedMethod, onMethodSelect, amount, onPaymentComplete }) => {
    const [processingPayment, setProcessingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const paymentMethods = [
        {
            id: 'cash',
            name: 'Efectivo',
            description: 'Pago contra entrega',
            icon: Banknote,
            color: 'green',
            available: true
        },
        {
            id: 'card',
            name: 'Tarjeta',
            description: 'Crédito o débito',
            icon: CreditCard,
            color: 'blue',
            available: true
        },
        {
            id: 'nequi',
            name: 'Nequi',
            description: 'Transferencia móvil',
            icon: Smartphone,
            color: 'purple',
            available: true
        },
        {
            id: 'daviplata',
            name: 'Daviplata',
            description: 'Billetera digital',
            icon: Smartphone,
            color: 'red',
            available: true
        },
        {
            id: 'qr',
            name: 'Código QR',
            description: 'Escanea y paga',
            icon: QrCode,
            color: 'indigo',
            available: false
        }
    ];

    const handleCardInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number
        if (name === 'number') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();
            if (formattedValue.length > 19) return;
        }

        // Format expiry date
        if (name === 'expiry') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
            }
            if (formattedValue.length > 5) return;
        }

        // Format CVV
        if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').substring(0, 4);
        }

        setCardDetails(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const processPayment = async () => {
        setProcessingPayment(true);
        setPaymentStatus(null);

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simulate payment result (90% success rate)
            const success = Math.random() > 0.1;

            if (success) {
                setPaymentStatus('success');
                setTimeout(() => {
                    onPaymentComplete({
                        method: selectedMethod,
                        status: 'paid',
                        transactionId: `TXN${Date.now()}`,
                        amount: amount
                    });
                }, 1500);
            } else {
                setPaymentStatus('error');
            }
        } catch (error) {
            setPaymentStatus('error');
        } finally {
            setProcessingPayment(false);
        }
    };

    const renderPaymentForm = () => {
        switch (selectedMethod) {
            case 'cash':
                return (
                    <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center text-green-700 mb-3">
                            <Banknote className="w-5 h-5 mr-2" />
                            <span className="font-medium">Pago en Efectivo</span>
                        </div>
                        <p className="text-green-600 text-sm mb-3">
                            Pagarás directamente al repartidor cuando recibas tu pedido.
                        </p>
                        <div className="bg-white p-3 rounded border border-green-200">
                            <p className="text-sm text-gray-700">
                                <strong>Total a pagar:</strong> ${amount?.toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Ten el dinero exacto o cambio disponible
                            </p>
                        </div>
                    </div>
                );

            case 'card':
                return (
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center text-blue-700 mb-4">
                            <CreditCard className="w-5 h-5 mr-2" />
                            <span className="font-medium">Pago con Tarjeta</span>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Número de tarjeta
                                </label>
                                <input
                                    type="text"
                                    name="number"
                                    value={cardDetails.number}
                                    onChange={handleCardInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="flex space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha de vencimiento
                                    </label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        value={cardDetails.expiry}
                                        onChange={handleCardInputChange}
                                        placeholder="MM/AA"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        CVV
                                    </label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={cardDetails.cvv}
                                        onChange={handleCardInputChange}
                                        placeholder="123"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre del titular
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={cardDetails.name}
                                    onChange={handleCardInputChange}
                                    placeholder="Como aparece en la tarjeta"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <button
                                onClick={processPayment}
                                disabled={processingPayment || !cardDetails.number || !cardDetails.expiry || !cardDetails.cvv}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                            >
                                {processingPayment ? 'Procesando...' : `Pagar $${amount?.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                );

            case 'nequi':
            case 'daviplata':
                return (
                    <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="flex items-center text-purple-700 mb-3">
                            <Smartphone className="w-5 h-5 mr-2" />
                            <span className="font-medium">
                {selectedMethod === 'nequi' ? 'Nequi' : 'Daviplata'}
              </span>
                        </div>

                        <div className="bg-white p-4 rounded border border-purple-200 mb-4">
                            <p className="text-sm text-gray-700 mb-2">
                                <strong>Número para transferir:</strong>
                            </p>
                            <p className="text-lg font-mono font-bold text-purple-700">
                                +57 300 123 4567
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                <strong>Valor:</strong> ${amount?.toLocaleString()}
                            </p>
                        </div>

                        <div className="text-sm text-purple-600 space-y-1">
                            <p>1. Abre tu app de {selectedMethod === 'nequi' ? 'Nequi' : 'Daviplata'}</p>
                            <p>2. Selecciona "Enviar dinero"</p>
                            <p>3. Ingresa el número y el valor exacto</p>
                            <p>4. Confirma la transacción</p>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (paymentStatus) {
        return (
            <div className="text-center p-6">
                {paymentStatus === 'success' ? (
                    <div className="text-green-600">
                        <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">¡Pago Exitoso!</h3>
                        <p>Tu pedido ha sido confirmado y está siendo preparado.</p>
                    </div>
                ) : (
                    <div className="text-red-600">
                        <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Error en el Pago</h3>
                        <p>Hubo un problema procesando tu pago. Intenta nuevamente.</p>
                        <button
                            onClick={() => {
                                setPaymentStatus(null);
                                setProcessingPayment(false);
                            }}
                            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            Reintentar
                        </button>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
                Métodos de Pago
            </h3>

            {/* Payment method selection */}
            <div className="grid grid-cols-1 gap-3 mb-6">
                {paymentMethods.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = selectedMethod === method.id;

                    return (
                        <button
                            key={method.id}
                            onClick={() => method.available && onMethodSelect(method.id)}
                            disabled={!method.available}
                            className={`p-4 border rounded-lg text-left transition-all ${
                                isSelected
                                    ? `border-${method.color}-500 bg-${method.color}-50`
                                    : method.available
                                        ? 'border-gray-200 hover:border-gray-300 bg-white'
                                        : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
                            }`}
                        >
                            <div className="flex items-center">
                                <IconComponent
                                    className={`w-6 h-6 mr-3 ${
                                        isSelected ? `text-${method.color}-600` : 'text-gray-500'
                                    }`}
                                />
                                <div className="flex-1">
                                    <div className={`font-medium ${
                                        isSelected ? `text-${method.color}-800` : 'text-gray-800'
                                    }`}>
                                        {method.name}
                                    </div>
                                    <div className={`text-sm ${
                                        isSelected ? `text-${method.color}-600` : 'text-gray-500'
                                    }`}>
                                        {method.description}
                                    </div>
                                </div>
                                {!method.available && (
                                    <span className="text-xs text-gray-400 bg-gray-200 px-2 py-1 rounded">
                    Próximamente
                  </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Payment form */}
            {selectedMethod && renderPaymentForm()}
        </div>
    );
};

export default PaymentMethods;