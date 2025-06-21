import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ordersService  } from '../services/orders';
import { User, MapPin, Phone, Mail, Clock, Package, Edit2, Shield } from 'lucide-react';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userOrders = await ordersService.getUserOrders(); // ❌
                setOrders(userOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
                toast.error('Error al cargar tus pedidos');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateUser(formData);
            setEditMode(false);
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
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
            preparing: 'En Preparación',
            ready: 'Listo',
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
        return new Date(dateString).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Accede a tu cuenta</h2>
                    <p className="text-gray-600">Debes iniciar sesión para ver tu perfil.</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'info', label: 'Información Personal', icon: User },
        { id: 'orders', label: 'Mis Pedidos', icon: Package },
        { id: 'security', label: 'Seguridad', icon: Shield }
    ];

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center">
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-white font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">{user.name}</h1>
                            <p className="text-gray-600">{user.email}</p>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-4 sticky top-6">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                activeTab === tab.id
                                                    ? 'bg-yellow-500 text-white'
                                                    : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                        >
                                            <Icon size={20} />
                                            <span className="font-medium">{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'info' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Información Personal
                                    </h2>
                                    <button
                                        onClick={() => setEditMode(!editMode)}
                                        className="flex items-center space-x-2 text-yellow-600 hover:text-yellow-700"
                                    >
                                        <Edit2 size={16} />
                                        <span>{editMode ? 'Cancelar' : 'Editar'}</span>
                                    </button>
                                </div>

                                {editMode ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nombre Completo
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Teléfono
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Dirección
                                            </label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                            />
                                        </div>

                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Guardar Cambios
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditMode(false)}
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3">
                                            <User size={20} className="text-gray-400" />
                                            <div>
                                                <span className="text-sm text-gray-500">Nombre</span>
                                                <p className="font-medium">{user.name}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <Mail size={20} className="text-gray-400" />
                                            <div>
                                                <span className="text-sm text-gray-500">Email</span>
                                                <p className="font-medium">{user.email}</p>
                                            </div>
                                        </div>

                                        {user.phone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone size={20} className="text-gray-400" />
                                                <div>
                                                    <span className="text-sm text-gray-500">Teléfono</span>
                                                    <p className="font-medium">{user.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {user.address && (
                                            <div className="flex items-center space-x-3">
                                                <MapPin size={20} className="text-gray-400" />
                                                <div>
                                                    <span className="text-sm text-gray-500">Dirección</span>
                                                    <p className="font-medium">{user.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Historial de Pedidos
                                </h2>

                                {loading ? (
                                    <Loading />
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-800 mb-2">
                                            No tienes pedidos aún
                                        </h3>
                                        <p className="text-gray-600">
                                            ¡Haz tu primer pedido y disfruta de nuestra deliciosa comida!
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="font-medium text-gray-800">
                                                            Pedido #{order.order_number}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 flex items-center">
                                                            <Clock size={14} className="mr-1" />
                                                            {formatDate(order.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                                                        <p className="text-lg font-bold text-gray-800 mt-1">
                                                            {formatCurrency(order.total_amount)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {order.items && order.items.length > 0 && (
                                                    <div className="border-t pt-3">
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            {order.items.length} producto{order.items.length > 1 ? 's' : ''}:
                                                        </p>
                                                        <div className="space-y-1">
                                                            {order.items.slice(0, 3).map((item, index) => (
                                                                <p key={index} className="text-sm text-gray-700">
                                                                    {item.quantity}x {item.product_name}
                                                                </p>
                                                            ))}
                                                            {order.items.length > 3 && (
                                                                <p className="text-sm text-gray-500">
                                                                    y {order.items.length - 3} más...
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white rounded-lg shadow-sm p-6">
                                <h2 className="text-xl font-bold text-gray-800 mb-6">
                                    Configuración de Seguridad
                                </h2>

                                <div className="space-y-6">
                                    <div className="border-b pb-4">
                                        <h3 className="font-medium text-gray-800 mb-2">
                                            Cambiar Contraseña
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Actualiza tu contraseña regularmente para mantener tu cuenta segura.
                                        </p>
                                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                            Cambiar Contraseña
                                        </button>
                                    </div>

                                    <div className="border-b pb-4">
                                        <h3 className="font-medium text-gray-800 mb-2">
                                            Verificación de Dos Factores
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Agrega una capa extra de seguridad a tu cuenta.
                                        </p>
                                        <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                                            Configurar 2FA
                                        </button>
                                    </div>

                                    <div>
                                        <h3 className="font-medium text-gray-800 mb-2">
                                            Cerrar Sesión en Todos los Dispositivos
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Cierra sesión en todos los dispositivos donde hayas iniciado sesión.
                                        </p>
                                        <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                            Cerrar Todas las Sesiones
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;