import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Phone, CreditCard, Package } from 'lucide-react';
import { ordersService  } from '../services/orders';
import Loading from '../components/common/Loading';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                if (orderId) {
                    const orderData = await ordersService.getOrderById(orderId);
                    setOrder(orderData);
                }
            } catch (err) {
                setError('Error al cargar la información del pedido');
                console.error('Error fetching order:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const getStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-600 bg-yellow-100',
            confirmed: 'text-blue-600 bg-blue-100',
            preparing: 'text-orange-600 bg-orange-100',
            ready: 'text-green-600 bg-green-100',
            delivered: 'text-green-700 bg-green-200',
            cancelled: 'text-red-600 bg-red-100'
        };
        return colors[status] || 'text-gray-600 bg-gray-100';
    };

    const getStatusText = (status) => {
        const texts = {
            pending: 'Pendiente',
            confirmed: 'Confirmado',
            preparing: 'En Preparación',
            ready: 'Listo para Entrega',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return texts[status] || status;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <Loading />;

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md mx-4">
                    <div className="text-red-500 mb-4">
                        <Package size={48} className="mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        {error || 'Pedido no encontrado'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        No pudimos encontrar la información de tu pedido.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header de Confirmación */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6 text-center">
                    <div className="text-green-500 mb-4">
                        <CheckCircle size={64} className="mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        ¡Pedido Confirmado!
                    </h1>
                    <p className="text-gray-600 mb-4">
                        Tu pedido ha sido recibido y está siendo procesado
                    </p>
                    <div className="bg-gray-100 rounded-lg p-4 inline-block">
                        <span className="text-sm text-gray-600">Número de Pedido</span>
                        <div className="text-2xl font-bold text-gray-800">
                            #{order.order_number}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Estado del Pedido */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Clock className="mr-2" size={20} />
                            Estado del Pedido
                        </h2>

                        <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Fecha del Pedido:</span>
                                <span className="font-medium">{formatDate(order.created_at)}</span>
                            </div>

                            {order.estimated_delivery_time && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tiempo Estimado:</span>
                                    <span className="font-medium">
                    {formatDate(order.estimated_delivery_time)}
                  </span>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <span className="text-gray-600">Método de Pago:</span>
                                <span className="font-medium capitalize">{order.payment_method}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-gray-600">Estado del Pago:</span>
                                <span className={`font-medium ${
                                    order.payment_status === 'paid' ? 'text-green-600' :
                                        order.payment_status === 'failed' ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                  {order.payment_status === 'paid' ? 'Pagado' :
                      order.payment_status === 'failed' ? 'Fallido' : 'Pendiente'}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información de Entrega */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="mr-2" size={20} />
                            Información de Entrega
                        </h2>

                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="text-gray-600 block">Dirección de Entrega:</span>
                                <span className="font-medium">{order.delivery_address}</span>
                            </div>

                            {order.delivery_phone && (
                                <div>
                                    <span className="text-gray-600 block">Teléfono de Contacto:</span>
                                    <span className="font-medium flex items-center">
                    <Phone size={16} className="mr-1" />
                                        {order.delivery_phone}
                  </span>
                                </div>
                            )}

                            {order.special_instructions && (
                                <div>
                                    <span className="text-gray-600 block">Instrucciones Especiales:</span>
                                    <span className="font-medium">{order.special_instructions}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Resumen del Pedido */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Resumen del Pedido
                    </h2>

                    <div className="space-y-4">
                        {order.items && order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center border-b pb-3">
                                <div className="flex-1">
                                    <h3 className="font-medium text-gray-800">{item.product_name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Cantidad: {item.quantity} x {formatCurrency(item.unit_price)}
                                    </p>
                                    {item.special_requests && (
                                        <p className="text-xs text-gray-500 italic">
                                            Nota: {item.special_requests}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                  <span className="font-bold text-gray-800">
                    {formatCurrency(item.total_price)}
                  </span>
                                </div>
                            </div>
                        ))}

                        {/* Total */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span>Total:</span>
                                <span className="text-yellow-600">
                  {formatCurrency(order.total_amount)}
                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Acciones */}
                <div className="bg-white rounded-lg shadow-sm p-6 mt-6 text-center">
                    <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                        <button
                            onClick={() => navigate('/profile')}
                            className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Ver Mis Pedidos
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                        >
                            Seguir Comprando
                        </button>
                    </div>

                    <div className="mt-6 text-sm text-gray-600">
                        <p>¿Tienes alguna pregunta sobre tu pedido?</p>
                        <button
                            onClick={() => navigate('/support')}
                            className="text-yellow-600 hover:text-yellow-700 font-medium"
                        >
                            Contacta nuestro soporte
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;