import { useState, useEffect } from 'react';
import { BarChart3, Users, ShoppingBag, DollarSign, TrendingUp, Eye } from 'lucide-react';
import { adminService } from '../../services/admin';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        activeProducts: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsData, ordersData] = await Promise.all([
                adminService.getStats(),
                adminService.getRecentOrders()
            ]);
            setStats(statsData);
            setRecentOrders(ordersData);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <div className="flex items-center mt-2">
                            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            <span className="text-green-500 text-sm font-medium">{trend}%</span>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-full" style={{ backgroundColor: color + '20' }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
        </div>
    );

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
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <div className="text-gray-500 text-sm">
                    Última actualización: {new Date().toLocaleString()}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Usuarios"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    color="var(--primary-orange)"
                    trend={12}
                />
                <StatCard
                    title="Pedidos Totales"
                    value={stats.totalOrders.toLocaleString()}
                    icon={ShoppingBag}
                    color="var(--primary-yellow)"
                    trend={8}
                />
                <StatCard
                    title="Ingresos Totales"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    icon={DollarSign}
                    color="var(--primary-red)"
                    trend={15}
                />
                <StatCard
                    title="Productos Activos"
                    value={stats.activeProducts.toLocaleString()}
                    icon={BarChart3}
                    color="var(--accent-red)"
                    trend={5}
                />
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Pedidos Recientes</h2>
                </div>
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
                                Fecha
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acción
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    #{order.order_number}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {order.customer_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendiente' :
                          order.status === 'confirmed' ? 'Confirmado' :
                              order.status === 'preparing' ? 'Preparando' :
                                  order.status === 'ready' ? 'Listo' :
                                      order.status === 'delivered' ? 'Entregado' : order.status}
                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${order.total_amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-primary-orange hover:text-primary-red flex items-center">
                                        <Eye className="w-4 h-4 mr-1" />
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                        <button className="w-full bg-primary-orange text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors">
                            Agregar Producto
                        </button>
                        <button className="w-full bg-primary-yellow text-gray-900 py-2 px-4 rounded-md hover:bg-yellow-500 transition-colors">
                            Ver Inventario
                        </button>
                        <button className="w-full bg-primary-red text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors">
                            Generar Reporte
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones</h3>
                    <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                            <p className="text-sm text-yellow-800">5 productos con stock bajo</p>
                        </div>
                        <div className="p-3 bg-blue-50 border-l-4 border-blue-400">
                            <p className="text-sm text-blue-800">3 pedidos pendientes</p>
                        </div>
                        <div className="p-3 bg-green-50 border-l-4 border-green-400">
                            <p className="text-sm text-green-800">12 nuevos usuarios hoy</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Servidor</span>
                            <span className="text-sm text-green-600 font-medium">En línea</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Base de Datos</span>
                            <span className="text-sm text-green-600 font-medium">Conectada</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Pagos</span>
                            <span className="text-sm text-green-600 font-medium">Activo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;