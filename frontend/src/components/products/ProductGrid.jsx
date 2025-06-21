import React, { useState, useEffect } from 'react';
import { Grid, Search, Filter, SortAsc, SortDesc } from 'lucide-react';
import ProductCard from './ProductCard';
import CategoryFilter from './CategoryFilter';
import Loading from '../common/Loading';

const ProductGrid = ({
                         products = [],
                         categories = [],
                         loading = false,
                         error = null,
                         onProductSelect = () => {},
                         showFilters = true,
                         gridCols = 'auto'
                     }) => {
    const [filteredProducts, setFilteredProducts] = useState(products);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        let filtered = [...products];

        // Filtrar por categoría
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category_id === parseInt(selectedCategory)
            );
        }

        // Filtrar por búsqueda
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Ordenar
        filtered.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];

            if (sortBy === 'price') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }

            if (sortBy === 'rating') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            }

            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredProducts(filtered);
    }, [products, selectedCategory, searchTerm, sortBy, sortOrder]);

    const getGridClasses = () => {
        if (gridCols === 'auto') {
            return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
        }
        return `grid grid-cols-${gridCols} gap-6`;
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="bg-primary-orange text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Filtros y búsqueda */}
            {showFilters && (
                <div className="mb-6 space-y-4">
                    {/* Barra de búsqueda */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                        />
                    </div>

                    {/* Filtros */}
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Filtro de categorías */}
                            <CategoryFilter
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onCategoryChange={setSelectedCategory}
                            />

                            {/* Ordenamiento */}
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-600" />
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-orange focus:border-transparent"
                                >
                                    <option value="name">Nombre</option>
                                    <option value="price">Precio</option>
                                    <option value="rating">Calificación</option>
                                    <option value="created_at">Más reciente</option>
                                </select>

                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    title={`Ordenar ${sortOrder === 'asc' ? 'descendente' : 'ascendente'}`}
                                >
                                    {sortOrder === 'asc' ? (
                                        <SortAsc className="w-4 h-4" />
                                    ) : (
                                        <SortDesc className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Contador de resultados */}
                        <div className="text-sm text-gray-600">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
                        </div>
                    </div>
                </div>
            )}

            {/* Grid de productos */}
            {filteredProducts.length > 0 ? (
                <div className={getGridClasses()}>
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => onProductSelect(product)}
                            className="w-full"
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <Grid className="w-16 h-16 mx-auto mb-4" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                        No se encontraron productos
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm || selectedCategory !== 'all'
                            ? 'Intenta ajustar los filtros de búsqueda'
                            : 'No hay productos disponibles en este momento'
                        }
                    </p>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory('all');
                            }}
                            className="mt-4 text-primary-orange hover:text-primary-red transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductGrid;