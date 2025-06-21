import React, { useState } from 'react';
import { Plus, Minus, Trash2, Edit3 } from 'lucide-react';
import { formatPrice } from '../../utils/helpers';

const CartItem = ({
                      item,
                      onUpdateQuantity = () => {},
                      onRemove = () => {},
                      onUpdateSpecialRequests = () => {},
                      showControls = true,
                      compact = false
                  }) => {
    const [isEditingRequests, setIsEditingRequests] = useState(false);
    const [tempRequests, setTempRequests] = useState(item.special_requests || '');

    const handleQuantityChange = (type) => {
        const newQuantity = type === 'increase' ? item.quantity + 1 : item.quantity - 1;
        if (newQuantity > 0) {
            onUpdateQuantity(newQuantity);
        }
    };

    const handleSaveRequests = () => {
        onUpdateSpecialRequests(tempRequests);
        setIsEditingRequests(false);
    };

    const handleCancelEdit = () => {
        setTempRequests(item.special_requests || '');
        setIsEditingRequests(false);
    };

    const itemTotal = item.price * item.quantity;

    return (
        <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
            compact ? 'p-3' : 'p-4'
        }`}>
            <div className="flex gap-4">
                {/* Imagen del producto */}
                <div className={`flex-shrink-0 ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
                    <img
                        src={item.image_url || '/images/placeholder-food.jpg'}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                    />
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className={`font-semibold text-gray-800 truncate pr-2 ${
                            compact ? 'text-sm' : 'text-base'
                        }`}>
                            {item.name}
                        </h3>
                        {showControls && (
                            <button
                                onClick={onRemove}
                                className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                                title="Eliminar producto"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Precio unitario */}
                    <p className={`text-gray-600 mb-2 ${compact ? 'text-sm' : 'text-base'}`}>
                        {formatPrice(item.price)} c/u
                    </p>

                    {/* Controles de cantidad */}
                    {showControls ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleQuantityChange('decrease')}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className={`w-8 text-center font-semibold ${
                                    compact ? 'text-sm' : 'text-base'
                                }`}>
                  {item.quantity}
                </span>
                                <button
                                    onClick={() => handleQuantityChange('increase')}
                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>

                            {/* Total del item */}
                            <span className={`font-bold text-primary-orange ${
                                compact ? 'text-sm' : 'text-lg'
                            }`}>
                {formatPrice(itemTotal)}
              </span>
                        </div>
                    ) : (
                        /* Solo mostrar cantidad y total */
                        <div className="flex items-center justify-between">
              <span className={`text-gray-600 ${compact ? 'text-sm' : 'text-base'}`}>
                Cantidad: {item.quantity}
              </span>
                            <span className={`font-bold text-primary-orange ${
                                compact ? 'text-sm' : 'text-lg'
                            }`}>
                {formatPrice(itemTotal)}
              </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instrucciones especiales */}
            {(item.special_requests || showControls) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                    {isEditingRequests ? (
                        <div className="space-y-2">
              <textarea
                  value={tempRequests}
                  onChange={(e) => setTempRequests(e.target.value)}
                  placeholder="Instrucciones especiales..."
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none"
                  rows="2"
              />
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveRequests}
                                    className="px-3 py-1 bg-primary-orange text-white text-xs rounded-lg hover:bg-opacity-90 transition-colors"
                                >
                                    Guardar
                                </button>
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                {item.special_requests ? (
                                    <p className="text-sm text-gray-600 italic">
                                        "{item.special_requests}"
                                    </p>
                                ) : showControls ? (
                                    <p className="text-sm text-gray-400">
                                        Sin instrucciones especiales
                                    </p>
                                ) : null}
                            </div>
                            {showControls && (
                                <button
                                    onClick={() => setIsEditingRequests(true)}
                                    className="p-1 text-gray-400 hover:text-primary-orange transition-colors flex-shrink-0"
                                    title="Editar instrucciones"
                                >
                                    <Edit3 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CartItem;