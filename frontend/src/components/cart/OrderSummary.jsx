import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info, Truck, Calculator } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

const OrderSummary = ({
                          subtotal = 0,
                          total = 0,
                          itemsCount = 0,
                          deliveryFee = 3000,
                          tax = 0,
                          discount = 0,
                          promoCode = '',
                          minOrderAmount = 15000,
                          showDetails = true,
                          showPromoCode = true,
                          onApplyPromo = () => {},
                          compact = false
                      }) => {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [tempPromoCode, setTempPromoCode] = useState('');
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    const calculatedTax = tax || (subtotal * 0.19); // 19% IVA por defecto
    const freeDeliveryThreshold = minOrderAmount;
    const actualDeliveryFee = subtotal >= freeDeliveryThreshold ? 0 : deliveryFee;
    const finalTotal = subtotal + calculatedTax + actualDeliveryFee - discount;

    const handleApplyPromo = async () => {
        if (!tempPromoCode.trim()) return;

        setIsApplyingPromo(true);
        try {
            await onApplyPromo(tempPromoCode.trim());
            setTempPromoCode('');
        } catch (error) {
            console.error('Error applying promo code:', error);
        } finally {
            setIsApplyingPromo(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleApplyPromo();
        }
    };

    return (
        <div className={`bg-white rounded-xl ${compact ? 'border-t border-gray-200 pt-4' : 'border border-gray-200 p-4'}`}>
            {/* Header */}
            <div
                className={`flex items-center justify-between ${compact ? 'cursor-pointer' : ''}`}
                onClick={compact ? () => setIsExpanded(!isExpanded) : undefined}
            >
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-primary-orange" />
                    Resumen del Pedido
                </h3>
                {compact && (
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary-orange">{formatPrice(finalTotal)}</span>
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {/* Items count */}
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{itemsCount} {itemsCount === 1 ? 'producto' : 'productos'}</span>
                    </div>

                    {/* Subtotal */}
                    <div className="flex justify-between">
                        <span className="text-gray-700">Subtotal</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>

                    {/* Delivery Fee */}
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1">
                            <Truck className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">Domicilio</span>
                            {subtotal >= freeDeliveryThreshold && (
                                <Info
                                    className="w-4 h-4 text-green-500"
                                    title={`Envío gratis en pedidos sobre ${formatPrice(freeDeliveryThreshold)}`}
                                />
                            )}
                        </div>
                        <div className="text-right">
                            {actualDeliveryFee > 0 ? (
                                <span className="font-medium">{formatPrice(actualDeliveryFee)}</span>
                            ) : (
                                <span className="text-green-600 font-medium">¡Gratis!</span>
                            )}
                        </div>
                    </div>

                    {/* Free delivery progress */}
                    {subtotal < freeDeliveryThreshold && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-yellow-700">Envío gratis en:</span>
                                <span className="font-semibold text-yellow-800">
                  {formatPrice(freeDeliveryThreshold - subtotal)}
                </span>
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((subtotal / freeDeliveryThreshold) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Tax */}
                    {calculatedTax > 0 && (
                        <div className="flex justify-between">
                            <span className="text-gray-700">IVA (19%)</span>
                            <span className="font-medium">{formatPrice(calculatedTax)}</span>
                        </div>
                    )}

                    {/* Discount */}
                    {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span>Descuento{promoCode && ` (${promoCode})`}</span>
                            <span className="font-medium">-{formatPrice(discount)}</span>
                        </div>
                    )}

                    {/* Promo Code */}
                    {showPromoCode && !promoCode && (
                        <div className="border-t border-gray-200 pt-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tempPromoCode}
                                    onChange={(e) => setTempPromoCode(e.target.value.toUpperCase())}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Código promocional"
                                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                />
                                <button
                                    onClick={handleApplyPromo}
                                    disabled={!tempPromoCode.trim() || isApplyingPromo}
                                    className="px-4 py-2 bg-primary-orange text-white text-sm rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isApplyingPromo ? '...' : 'Aplicar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Total */}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-800">Total</span>
                            <span className="text-xl font-bold text-primary-orange">
                {formatPrice(finalTotal)}
              </span>
                        </div>
                    </div>

                    {/* Minimum order warning */}
                    {subtotal < minOrderAmount && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700">
                                <strong>Pedido mínimo:</strong> {formatPrice(minOrderAmount)}
                                <br />
                                Agrega {formatPrice(minOrderAmount - subtotal)} más para continuar
                            </p>
                        </div>
                    )}

                    {/* Estimated time */}
                    {showDetails && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-sm text-blue-700">
                                <Info className="w-4 h-4 flex-shrink-0" />
                                <span>Tiempo estimado de entrega: 30-45 minutos</span>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderSummary;