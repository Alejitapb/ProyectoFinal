import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AdminDashboard from '../components/admin/AdminDashboard';
import ProductEditor from '../components/admin/ProductEditor';
import InventoryManager from '../components/admin/InventoryManager';
import OrdersMonitor from '../components/admin/OrdersMonitor';
import ReportsGenerator from '../components/admin/ReportsGenerator';
import { BarChart3, Package, ShoppingCart, FileText, Settings } from 'lucide-react';

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const { user } = useAuth();

    // Verificar si el usuario es admin
    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'products', label: 'Productos', icon: Package },
        { id: 'inventory', label: 'Inventario', icon: Settings },
        { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
        { id: 'reports', label: 'Reportes', icon: FileText }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard />;
            case 'products':
                return <ProductEditor />;
            case 'inventory':
                return <InventoryManager />;
            case 'orders':
                return <OrdersMonitor />;
            case 'reports':
                return <ReportsGenerator />;
            default:
                return <AdminDashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between py-4">
                        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">Bienvenido, {user.name}</span>
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Sidebar */}
                    <div className="lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-lg shadow-sm p-4">
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
                    <div className="flex-1">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Admin;