import { useState, useEffect } from 'react';
import {
    Calendar,
    Download,
    BarChart3,
    TrendingUp,
    DollarSign,
    ShoppingBag,
    Users,
    Clock,
    Filter,
    FileText,
    PieChart,
    Activity
} from 'lucide-react';
import { ordersService } from '../../services/orders';
import { formatCurrency, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const ReportsGenerator = () => {
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [reportType, setReportType] = useState('sales');
    const [reportData, setReportData] = useState(null);
    const [filters, setFilters] = useState({
        category: '',
        status: '',
        paymentMethod: ''
    });

    const reportTypes = [
        { value: 'sales', label: 'Reporte de Ventas', icon: DollarSign },
        { value: 'products', label: 'Productos Más Vendidos', icon: ShoppingBag },
        { value: 'customers', label: 'Análisis de Clientes', icon: Users },
        { value: 'orders', label: 'Estado de Pedidos', icon: Clock },
        { value: 'revenue', label: 'Ingresos por Período', icon: TrendingUp },
        { value: 'performance', label: 'Rendimiento General', icon: Activity }
    ];

    const exportFormats = [
        { value: 'pdf', label: 'PDF' },
        { value: 'excel', label: 'Excel' },
        { value: 'csv', label: 'CSV' }
    ];

    useEffect(() => {
        generateReport();
    }, [reportType, dateRange, filters]);

    const generateReport = async () => {
        setLoading(true);
        try {
            const params = {
                type: reportType,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                ...filters
            };

            const response = await ordersService.generateReport(params);
            setReportData(response.data);
        } catch (error) {
            console.error('Error generating report:', error);
            toast.error('Error al generar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        setLoading(true);
        try {
            const params = {
                type: reportType,
                startDate: dateRange.startDate,
                endDate: dateRange.endDate,
                format,
                ...filters
            };

            const response = await ordersService.exportReport(params);

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_${reportType}_${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success(`Reporte exportado en formato ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Error exporting report:', error);
            toast.error('Error al exportar el reporte');
        } finally {
            setLoading(false);
        }
    };

    const renderSalesReport = () => {
        if (!reportData) return null;

        return (
            <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ventas Totales</p>
                                <p className="text-2xl font-bold text-primary-red">
                                    {formatCurrency(reportData.totalSales || 0)}
                                </p>
                            </div>
                            <DollarSign className="w-8 h-8 text-primary-orange" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pedidos</p>
                                <p className="text-2xl font-bold text-primary-red">
                                    {reportData.totalOrders || 0}
                                </p>
                            </div>
                            <ShoppingBag className="w-8 h-8 text-primary-orange" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ticket Promedio</p>
                                <p className="text-2xl font-bold text-primary-red">
                                    {formatCurrency(reportData.averageTicket || 0)}
                                </p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-primary-orange" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Clientes Únicos</p>
                                <p className="text-2xl font-bold text-primary-red">
                                    {reportData.uniqueCustomers || 0}
                                </p>
                            </div>
                            <Users className="w-8 h-8 text-primary-orange" />
                        </div>
                    </div>
                </div>

                {/* Daily Sales Chart */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Ventas Diarias</h3>
                    <div className="h-64 flex items-end justify-between space-x-2">
                        {reportData.dailySales?.map((day, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center">
                                <div
                                    className="bg-primary-orange rounded-t w-full"
                                    style={{
                                        height: `${(day.amount / Math.max(...reportData.dailySales.map(d => d.amount))) * 200}px`,
                                        minHeight: '5px'
                                    }}
                                ></div>
                                <p className="text-xs text-gray-600 mt-2 text-center">
                                    {formatDate(day.date, { day: 'numeric', month: 'short' })}
                                </p>
                                <p className="text-xs font-semibold">
                                    {formatCurrency(day.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
                    <div className="space-y-3">
                        {reportData.topProducts?.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-primary-orange text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                                    <div>
                                        <p className="font-medium">{product.name}</p>
                                        <p className="text-sm text-gray-600">{product.quantity} unidades vendidas</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-primary-red">
                                    {formatCurrency(product.revenue)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderProductsReport = () => {
        if (!reportData) return null;

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Análisis de Productos</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left p-3">Producto</th>
                                <th className="text-left p-3">Categoría</th>
                                <th className="text-left p-3">Vendidos</th>
                                <th className="text-left p-3">Ingresos</th>
                                <th className="text-left p-3">Stock</th>
                                <th className="text-left p-3">Popularidad</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reportData.products?.map((product) => (
                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={product.image_url || '/images/placeholder-food.jpg'}
                                                alt={product.name}
                                                className="w-10 h-10 rounded object-cover"
                                            />
                                            <span className="font-medium">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-3">{product.category}</td>
                                    <td className="p-3">{product.sold_quantity}</td>
                                    <td className="p-3">{formatCurrency(product.revenue)}</td>
                                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                          product.stock > 10 ? 'bg-green-100 text-green-800' :
                              product.stock > 0 ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                                    </td>
                                    <td className="p-3">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-primary-orange h-2 rounded-full"
                                                style={{ width: `${product.popularity}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderCustomersReport = () => {
        if (!reportData) return null;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="font-semibold text-gray-700 mb-2">Nuevos Clientes</h4>
                        <p className="text-3xl font-bold text-green-600">{reportData.newCustomers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="font-semibold text-gray-700 mb-2">Clientes Recurrentes</h4>
                        <p className="text-3xl font-bold text-blue-600">{reportData.returningCustomers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h4 className="font-semibold text-gray-700 mb-2">Tasa de Retención</h4>
                        <p className="text-3xl font-bold text-primary-orange">{reportData.retentionRate}%</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Top Clientes</h3>
                    <div className="space-y-3">
                        {reportData.topCustomers?.map((customer, index) => (
                            <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div className="flex items-center space-x-3">
                  <span className="w-8 h-8 bg-primary-red text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                                    <div>
                                        <p className="font-medium">{customer.name}</p>
                                        <p className="text-sm text-gray-600">{customer.email}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">{customer.orders} pedidos</p>
                                    <p className="text-sm text-primary-red">{formatCurrency(customer.total_spent)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const renderOrdersReport = () => {
        if (!reportData) return null;

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(reportData.ordersByStatus || {}).map(([status, count]) => (
                        <div key={status} className="bg-white p-4 rounded-lg shadow-sm border text-center">
                            <p className="text-2xl font-bold text-primary-red">{count}</p>
                            <p className="text-sm text-gray-600 capitalize">{status}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Tiempo Promedio de Entrega</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-orange">{reportData.avgPreparationTime || 0}</p>
                            <p className="text-gray-600">min preparación</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-orange">{reportData.avgDeliveryTime || 0}</p>
                            <p className="text-gray-600">min entrega</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary-orange">{reportData.avgTotalTime || 0}</p>
                            <p className="text-gray-600">min total</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderReportContent = () => {
        switch (reportType) {
            case 'sales':
                return renderSalesReport();
            case 'products':
                return renderProductsReport();
            case 'customers':
                return renderCustomersReport();
            case 'orders':
                return renderOrdersReport();
            case 'revenue':
                return renderSalesReport(); // Similar to sales
            case 'performance':
                return (
                    <div className="space-y-6">
                        {renderSalesReport()}
                        {renderOrdersReport()}
                    </div>
                );
            default:
                return <div className="text-center text-gray-500">Selecciona un tipo de reporte</div>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Generador de Reportes</h2>
                        <p className="text-gray-600">Analiza el rendimiento de tu negocio</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {exportFormats.map((format) => (
                            <button
                                key={format.value}
                                onClick={() => exportReport(format.value)}
                                disabled={loading || !reportData}
                                className="btn btn-outline btn-sm flex items-center space-x-2"
                            >
                                <Download className="w-4 h-4" />
                                <span>{format.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Tipo de Reporte
                        </label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="form-select w-full"
                        >
                            {reportTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Fecha Inicio
                        </label>
                        <input
                            type="date"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className="form-input w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Fecha Fin
                        </label>
                        <input
                            type="date"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className="form-input w-full"
                        />
                    </div>

                    {/* Generate Button */}
                    <div className="flex items-end">
                        <button
                            onClick={generateReport}
                            disabled={loading}
                            className="btn btn-primary w-full flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                <BarChart3 className="w-4 h-4" />
                            )}
                            <span>{loading ? 'Generando...' : 'Generar'}</span>
                        </button>
                    </div>
                </div>

                {/* Additional Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="form-select w-full"
                        >
                            <option value="">Todas las categorías</option>
                            <option value="pollo-frito">Pollo Frito</option>
                            <option value="arroces">Arroces</option>
                            <option value="acompañantes">Acompañantes</option>
                            <option value="bebidas">Bebidas</option>
                            <option value="postres">Postres</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="form-select w-full"
                        >
                            <option value="">Todos los estados</option>
                            <option value="pending">Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="preparing">Preparando</option>
                            <option value="ready">Listo</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago</label>
                        <select
                            value={filters.paymentMethod}
                            onChange={(e) => setFilters(prev => ({ ...prev, paymentMethod: e.target.value }))}
                            className="form-select w-full"
                        >
                            <option value="">Todos los métodos</option>
                            <option value="cash">Efectivo</option>
                            <option value="card">Tarjeta</option>
                            <option value="transfer">Transferencia</option>
                            <option value="online">Pago en línea</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="min-h-[400px]">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-orange mx-auto"></div>
                            <p className="mt-4 text-gray-600">Generando reporte...</p>
                        </div>
                    </div>
                ) : reportData ? (
                    renderReportContent()
                ) : (
                    <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay datos disponibles</h3>
                        <p className="text-gray-600">
                            Ajusta los filtros y genera un reporte para ver los datos
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            {reportData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-lg font-semibold mb-4">Resumen Rápido</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <PieChart className="w-8 h-8 text-primary-yellow mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Período</p>
                            <p className="font-semibold">
                                {formatDate(dateRange.startDate)} - {formatDate(dateRange.endDate)}
                            </p>
                        </div>

                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <TrendingUp className="w-8 h-8 text-primary-orange mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Tendencia</p>
                            <p className="font-semibold text-green-600">
                                {reportData.growth >= 0 ? '+' : ''}{reportData.growth || 0}%
                            </p>
                        </div>

                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <Activity className="w-8 h-8 text-primary-red mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Satisfacción</p>
                            <p className="font-semibold">
                                {reportData.satisfaction || 0}%
                            </p>
                        </div>

                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">Tiempo Prom.</p>
                            <p className="font-semibold">
                                {reportData.avgDeliveryTime || 0} min
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Actions */}
            {reportData && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                        <div>
                            <h4 className="font-semibold text-gray-700">Acciones del Reporte</h4>
                            <p className="text-sm text-gray-600">
                                Exporta o programa reportes automáticos
                            </p>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={() => window.print()}
                                className="btn btn-outline btn-sm flex items-center space-x-2"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Imprimir</span>
                            </button>

                            <button
                                onClick={() => {
                                    const subject = `Reporte ${reportTypes.find(t => t.value === reportType)?.label}`;
                                    const body = `Reporte generado para el período: ${dateRange.startDate} - ${dateRange.endDate}`;
                                    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                }}
                                className="btn btn-outline btn-sm flex items-center space-x-2"
                            >
                                <FileText className="w-4 h-4" />
                                <span>Enviar por Email</span>
                            </button>

                            <button
                                onClick={generateReport}
                                className="btn btn-primary btn-sm flex items-center space-x-2"
                            >
                                <BarChart3 className="w-4 h-4" />
                                <span>Actualizar</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsGenerator;