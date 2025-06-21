import { useState, useEffect } from 'react';
import { Clock, Eye, RefreshCw, Filter, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin';
import { toast } from 'react-hot-toast';

const OrdersMonitor = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        loadOrders();
        let interval;

        if (autoRefresh) {
            interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    useEffect(() => {
        filterOrders();
    }, [orders, statusFilter]);

    const loadOrders = async () => {
        try {
            const data = await adminService.getAllOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
            toast.error('Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = orders;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Sort by creation date (newest first)
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setFilteredOrders(filtered);
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await adminService.updateOrderStatus(orderId, newStatus);
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));
            toast.success('Estado del pedido actualizado');
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Error al actualizar el estado del pedido');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-orange-100 text-orange-800';
            case 'ready': return 'bg-green-100 text-green-800';
            case 'delivered': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'confirmed': return 'Confirmado';
            case 'preparing': return 'Preparando';
            case 'ready': return 'Listo';
            case 'delivered': return 'Entregado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getNextStatus = (currentStatus) => {
        const statusFlow = {
            'pending': 'confirmed',
            'confirmed': 'preparing',
            'preparing': 'ready',
            'ready': 'delivered'
        };
        return statusFlow[currentStatus];
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit'
        });
    };

    const getOrderStats = () => {
        return {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            confirmed: orders.filter(o => o.status === 'confirmed').length,
            preparing: orders.filter(o => o.status === 'preparing').length,
            ready: orders.filter(o => o.status === 'ready').length,
            delivered: orders.filter(o => o.status === 'delivered').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };
    };

    const stats = getOrderStats();

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Monitor de Pedidos</h1>
                <div className="flex items-center space-x-3">
                    <label className="flex items-center text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="mr-2"
                        />
                        Auto-actualizar
                    </label>
                    <button
                        onClick={loadOrders}
                        className="flex items-center px-3 py-2 bg-primary-orange text-white rounded-md hover:bg-orange-600 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Actualizar
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-sm text-gray-600">Total</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        <p className="text-sm text-gray-600">Pendientes</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
                        <p className="text-sm text-gray-600">Confirmados</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">{stats.preparing}</p>
                        <p className="text-sm text-gray-600">Preparando</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
                        <p className="text-sm text-gray-600">Listos</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-gray-600">{stats.delivered}</p>
                        <p className="text-sm text-gray-600">Entregados</p>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                        <p className="text-sm text-gray-600">Cancelados</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center space-x-4">
                    <Filter className="w-5 h-5 text-gray-400" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="confirmed">Confirmados</option>
                        <option value="preparing">Preparando</option>
                        <option value="ready">Listos</option>
                        <option value="delivered">Entregados</option>
                        <option value="cancelled">Cancelados</option>
                    </select>
                    <span className="text-sm text-gray-500">
            Mostrando {filteredOrders.length} de {orders.length} pedidos
          </span>
                </div>
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Pedido
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cliente
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Total
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hora
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        #{order.order_number}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {order.items?.length || 0} productos
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {order.customer_name}
                                    </div>
                                    <div className="text-sm text-gray-500 flex items-center">
                                        <Phone className="w-3 h-3 mr-1" />
                                        {order.delivery_phone}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${order.total_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <Clock className="w-3 h-3 mr-1" />
                                        {formatTime(order.created_at)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="text-primary-orange hover:text-orange-600 flex items-center"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Ver
                                        </button>
                                        {getNextStatus(order.status) && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, getNextStatus(order.status))}
                                                className="text-green-600 hover:text-green-800 flex items-center"
                                            >
                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                Avanzar
                                            </button>
                                        )}
                                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                            <button
                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                className="text-red-600 hover:text-red-800 flex items-center"
                                            >
                                                <XCircle className="w-4 h-4 mr-1" />
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {statusFilter !== 'all'
                                ? `No hay pedidos con estado "${getStatusText(statusFilter)}".`
                                : 'No se han realizado pedidos aún.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Pedido #{selectedOrder.order_number}
                            </h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p><strong>Nombre:</strong> {selectedOrder.customer_name}</p>
                                    <p><strong>Teléfono:</strong> {selectedOrder.delivery_phone}</p>
                                    <div className="flex items-start mt-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                                        <div>
                                            <strong>Dirección:</strong>
                                            <p className="text-gray-700">{selectedOrder.delivery_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Productos</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between items-center py-2 border-b">
                                            <div>
                                                <p className="font-medium">{item.product_name}</p>
                                                <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">${item.total_price.toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Total del Pedido:</span>
                                    <span>${selectedOrder.total_amount.toLocaleString()}</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>Método de pago: {selectedOrder.payment_method || 'No especificado'}</p>
                                    <p>Estado de pago: {selectedOrder.payment_status || 'Pendiente'}</p>
                                </div>
                            </div>

                            {/* Special Instructions */}
                            {selectedOrder.special_instructions && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Instrucciones Especiales</h3>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-gray-700">{selectedOrder.special_instructions}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersMonitor;