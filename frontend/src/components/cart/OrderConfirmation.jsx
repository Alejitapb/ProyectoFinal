import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Phone, Package, Star, ArrowRight } from 'lucide-react';
import { ordersApi } from '../../services/orders';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../common/Loading';
import toast from 'react-hot-toast';

const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await ordersApi.getOrderById(orderId);
            setOrder(response.data);
        } catch (error) {
            console.error('Error fetching order:', error);
            setError('No se pudo cargar la información del pedido');
            toast.error('Error al cargar el pedido');
        } finally {
            setLoading(false);
        }
    };

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
            preparing: 'En preparación',
            ready: 'Listo para entrega',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return texts[status] || status;
    };

    const getEstimatedTime = () => {
        if (!order?.estimated_delivery_time) return 'No disponible';

        const deliveryTime = new Date(order.estimated_delivery_time);
        const now = new Date();
        const diffInMinutes = Math.max(0, Math.floor((deliveryTime - now) / (1000 * 60)));

        if (diffInMinutes === 0) return 'Muy pronto';
        if (diffInMinutes < 60) return `${diffInMinutes} minutos`;

        const hours = Math.floor(diffInMinutes / 60);
        const minutes = diffInMinutes % 60;
        return `${hours}h ${minutes}m`;
    };

    const handleTrackOrder = () => {
        navigate(`/orders/${orderId}/track`);
    };

    const handleOrderAgain = () => {
        // Agregar productos al carrito y redirigir
        navigate('/menu');
        toast.success('¡Puedes ordenar los mismos productos desde el menú!');
    };

    if (loading) return <Loading />;

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Pedido no encontrado
                    </h2>
                    <p className="text-gray-600 mb-6">
                        {error || 'No se pudo encontrar la información de este pedido'}
                    </p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="bg-primary-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                    >
                        Volver al menú
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header de confirmación */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
                    <div className="text-green-500 text-6xl mb-4">
                        <CheckCircle className="w-16 h-16 mx-auto" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        ¡Pedido confirmado!
                    </h1>
                    <p className="text-gray-600 text-lg mb-4">
                        Tu pedido #{order.order_number} ha sido recibido exitosamente
                    </p>
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        <Clock className="w-4 h-4 mr-2" />
                        {getStatusText(order.status)}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del pedido */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-primary-orange" />
                            Detalles del pedido
                        </h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium text-gray-600">Número de pedido:</span>
                                <span className="font-bold text-gray-800">#{order.order_number}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium text-gray-600">Fecha:</span>
                                <span className="text-gray-800">
                  {new Date(order.created_at).toLocaleDateString('es-CO', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  })}
                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium text-gray-600">Tiempo estimado:</span>
                                <span className="text-primary-orange font-semibold">
                  {getEstimatedTime()}
                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="font-medium text-gray-600">Método de pago:</span>
                                <span className="text-gray-800 capitalize">
                  {order.payment_method || 'Efectivo'}
                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 font-bold text-lg">
                                <span>Total:</span>
                                <span className="text-primary-orange">
                  ${order.total_amount?.toLocaleString('es-CO')}
                </span>
                            </div>
                        </div>
                    </div>

                    {/* Información de entrega */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-primary-orange" />
                            Información de entrega
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Dirección de entrega:
                                </label>
                                <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                    {order.delivery_address}
                                </p>
                            </div>

                            {order.delivery_phone && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Teléfono de contacto:
                                    </label>
                                    <p className="text-gray-800 flex items-center bg-gray-50 p-3 rounded-lg">
                                        <Phone className="w-4 h-4 mr-2 text-primary-orange" />
                                        {order.delivery_phone}
                                    </p>
                                </div>
                            )}

                            {order.special_instructions && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 mb-1">
                                        Instrucciones especiales:
                                    </label>
                                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                        {order.special_instructions}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Productos ordenados */}
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Productos ordenados
                    </h2>

                    <div className="space-y-4">
                        {order.items?.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={item.image_url || '/images/default-product.jpg'}
                                        alt={item.name}
                                        className="w-16 h-16 object-cover rounded-lg"
                                    />
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                        <p className="text-sm text-gray-600">
                                            Cantidad: {item.quantity}
                                        </p>
                                        {item.special_requests && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                Notas: {item.special_requests}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-gray-800">
                                        ${item.total_price?.toLocaleString('es-CO')}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        ${item.unit_price?.toLocaleString('es-CO')} c/u
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acciones */}
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={handleTrackOrder}
                            className="bg-primary-orange text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center"
                        >
                            <Package className="w-5 h-5 mr-2" />
                            Seguir pedido
                        </button>

                        <button
                            onClick={handleOrderAgain}
                            className="bg-primary-yellow text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors flex items-center justify-center"
                        >
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Ordenar de nuevo
                        </button>

                        <button
                            onClick={() => navigate('/reviews/create', {
                                state: { orderId: order.id, products: order.items }
                            })}
                            className="border-2 border-primary-orange text-primary-orange px-6 py-3 rounded-lg font-semibold hover:bg-primary-orange hover:text-white transition-colors flex items-center justify-center"
                        >
                            <Star className="w-5 h-5 mr-2" />
                            Calificar pedido
                        </button>
                    </div>
                </div>

                {/* Información adicional */}
                <div className="bg-primary-yellow/20 rounded-lg p-6 mt-6 border-l-4 border-primary-yellow">
                    <h3 className="font-bold text-gray-800 mb-2">
                        ¿Necesitas ayuda con tu pedido?
                    </h3>
                    <p className="text-gray-700 mb-4">
                        Si tienes alguna pregunta o problema con tu pedido, no dudes en contactarnos.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/support')}
                            className="text-primary-orange hover:underline font-medium"
                        >
                            Centro de ayuda
                        </button>
                        <a
                            href="tel:+573001234567"
                            className="text-primary-orange hover:underline font-medium"
                        >
                            Llamar al restaurante
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;