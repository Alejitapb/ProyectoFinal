import React, { useState, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import Container from '../components/common/Container';
import Loading from '../components/common/Loading';
import ProductGrid from '../components/products/ProductGrid';
import CategoryFilter from '../components/products/CategoryFilter';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import toast from 'react-hot-toast';

const Menu = () => {
    const { products, categories, loading, error } = useProducts();
    const { addToCart } = useCart();
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let filtered = [...products];

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category_id === parseInt(selectedCategory)
            );
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort products
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'price') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else if (sortBy === 'rating') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else {
                aValue = aValue.toString().toLowerCase();
                bValue = bValue.toString().toLowerCase();
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredProducts(filtered);
    }, [products, selectedCategory, searchTerm, sortBy, sortOrder]);

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(`${product.name} agregado al carrito`);
    };

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(categoryId);
    };

    const handleSortChange = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    if (loading) return <Loading />;

    if (error) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-red-500 text-lg">Error al cargar el menú: {error}</p>
                </div>
            </Container>
        );
    }

    return (
        <div className="min-h-screen bg-gray-light">
            <Container>
                <div className="py-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-dark mb-4">
                            Nuestro Menú
                        </h1>
                        <p className="text-lg text-gray-medium">
                            Descubre todos nuestros deliciosos productos
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-medium" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar productos..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                />
                            </div>

                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="lg:hidden bg-primary-orange text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            >
                                <Filter size={16} />
                                Filtros
                            </button>

                            {/* Desktop Filters */}
                            <div className="hidden lg:flex items-center gap-4">
                                {/* Sort Options */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-dark">Ordenar por:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="border border-gray-medium rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                    >
                                        <option value="name">Nombre</option>
                                        <option value="price">Precio</option>
                                        <option value="rating">Calificación</option>
                                    </select>
                                    <button
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        className="p-1 hover:bg-gray-light rounded"
                                    >
                                        {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        {showFilters && (
                            <div className="lg:hidden mt-4 pt-4 border-t border-gray-light">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-dark">Ordenar por:</span>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="border border-gray-medium rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                        >
                                            <option value="name">Nombre</option>
                                            <option value="price">Precio</option>
                                            <option value="rating">Calificación</option>
                                        </select>
                                        <button
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                            className="p-1 hover:bg-gray-light rounded"
                                        >
                                            {sortOrder === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Category Filter */}
                    <div className="mb-8">
                        <CategoryFilter
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                        />
                    </div>

                    {/* Results Info */}
                    <div className="mb-6">
                        <p className="text-gray-medium">
                            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                            {selectedCategory !== 'all' && (
                                <span className="ml-2">
                  en {categories.find(cat => cat.id === parseInt(selectedCategory))?.name}
                </span>
                            )}
                            {searchTerm && (
                                <span className="ml-2">
                  para "{searchTerm}"
                </span>
                            )}
                        </p>
                    </div>

                    {/* Products Grid */}
                    {filteredProducts.length > 0 ? (
                        <ProductGrid
                            products={filteredProducts}
                            onAddToCart={handleAddToCart}
                        />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-medium text-lg">
                                No se encontraron productos que coincidan con tu búsqueda.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="mt-4 bg-primary-orange text-white px-6 py-2 rounded-lg hover:bg-primary-red transition-colors"
                            >
                                Limpiar filtros
                            </button>
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default Menu;