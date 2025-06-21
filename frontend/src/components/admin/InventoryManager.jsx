import { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Plus, AlertTriangle, Package } from 'lucide-react';
import { productsService } from '../../services/products';
import ProductEditor from './ProductEditor';
import { toast } from 'react-hot-toast';

const InventoryManager = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [showEditor, setShowEditor] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm, selectedCategory, stockFilter]);

    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getAllProducts(),
                productService.getCategories()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(product => product.category_id === parseInt(selectedCategory));
        }

        // Filter by stock
        if (stockFilter === 'low') {
            filtered = filtered.filter(product => product.stock_quantity <= 5);
        } else if (stockFilter === 'out') {
            filtered = filtered.filter(product => product.stock_quantity === 0);
        } else if (stockFilter === 'available') {
            filtered = filtered.filter(product => product.stock_quantity > 0);
        }

        setFilteredProducts(filtered);
    };

    const handleEdit = (product) => {
        setEditingProduct(product.id);
        setShowEditor(true);
    };

    const handleDelete = async (productId) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            return;
        }

        try {
            await productService.deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
            toast.success('Producto eliminado exitosamente');
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error('Error al eliminar el producto');
        }
    };

    const handleSave = (savedProduct) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === savedProduct.id ? savedProduct : p));
        } else {
            setProducts([...products, savedProduct]);
        }
        setEditingProduct(null);
    };

    const handleCloseEditor = () => {
        setShowEditor(false);
        setEditingProduct(null);
    };

    const getStockStatus = (quantity) => {
        if (quantity === 0) return { text: 'Agotado', color: 'text-red-600 bg-red-100' };
        if (quantity <= 5) return { text: 'Stock Bajo', color: 'text-yellow-600 bg-yellow-100' };
        return { text: 'Disponible', color: 'text-green-600 bg-green-100' };
    };

    const getCategoryName = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : 'Sin categoría';
    };

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
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
                <button
                    onClick={() => setShowEditor(true)}
                    className="flex items-center px-4 py-2 bg-primary-orange text-white rounded-md hover:bg-orange-600 transition-colors"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Producto
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                        />
                    </div>

                    <div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <select
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-orange"
                        >
                            <option value="all">Todo el stock</option>
                            <option value="available">Disponible</option>
                            <option value="low">Stock bajo</option>
                            <option value="out">Agotado</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} productos encontrados
            </span>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Filtros activos</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <Package className="w-8 h-8 text-blue-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Total Productos</p>
                            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <Package className="w-8 h-8 text-green-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Disponibles</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.stock_quantity > 0).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Stock Bajo</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 5).length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                        <div>
                            <p className="text-sm text-gray-600">Agotados</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {products.filter(p => p.stock_quantity === 0).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Producto
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disponible
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {filteredProducts.map((product) => {
                            const stockStatus = getStockStatus(product.stock_quantity);
                            return (
                                <tr key={product.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0">
                                                <img
                                                    className="h-10 w-10 rounded-full object-cover"
                                                    src={product.image_url || '/images/placeholder-product.jpg'}
                                                    alt={product.name}
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {product.name}
                                                </div>
                                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                                    {product.description}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {getCategoryName(product.category_id)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ${product.price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {product.stock_quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                        {stockStatus.text}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_available
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                      }`}>
                        {product.is_available ? 'Sí' : 'No'}
                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="text-primary-orange hover:text-orange-600 flex items-center"
                                            >
                                                <Edit className="w-4 h-4 mr-1" />
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
                                                className="text-red-600 hover:text-red-800 flex items-center"
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-8">
                        <Package className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {searchTerm || selectedCategory || stockFilter !== 'all'
                                ? 'No se encontraron productos con los filtros aplicados.'
                                : 'Comienza agregando un nuevo producto.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Product Editor Modal */}
            {showEditor && (
                <ProductEditor
                    productId={editingProduct}
                    onClose={handleCloseEditor}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

export default InventoryManager;