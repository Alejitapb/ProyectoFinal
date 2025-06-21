import React from 'react';
import {
    UtensilsCrossed,
    Coffee,
    Pizza,
    Soup,
    IceCream,
    Wine,
    ChefHat
} from 'lucide-react';

const CategoryFilter = ({
                            categories = [],
                            selectedCategory = 'all',
                            onCategoryChange = () => {},
                            variant = 'horizontal', // 'horizontal' | 'vertical' | 'pills'
                            showIcons = true,
                            showCount = false,
                            products = []
                        }) => {

    // Iconos por categoría
    const getCategoryIcon = (categoryName) => {
        const name = categoryName.toLowerCase();

        if (name.includes('pollo') || name.includes('frito')) return ChefHat;
        if (name.includes('arroz') || name.includes('sopa')) return Soup;
        if (name.includes('acompañ') || name.includes('guarnición')) return UtensilsCrossed;
        if (name.includes('bebida') || name.includes('refresco')) return Wine;
        if (name.includes('postre') || name.includes('dulce')) return IceCream;
        if (name.includes('café') || name.includes('té')) return Coffee;
        if (name.includes('pizza') || name.includes('pasta')) return Pizza;

        return UtensilsCrossed;
    };

    // Contar productos por categoría
    const getProductCount = (categoryId) => {
        if (!showCount || !products.length) return 0;
        if (categoryId === 'all') return products.length;
        return products.filter(product => product.category_id === parseInt(categoryId)).length;
    };

    const allCategories = [
        { id: 'all', name: 'Todos los productos', icon: UtensilsCrossed },
        ...categories.map(cat => ({
            ...cat,
            icon: getCategoryIcon(cat.name)
        }))
    ];

    const getContainerClasses = () => {
        switch (variant) {
            case 'vertical':
                return 'flex flex-col space-y-2';
            case 'pills':
                return 'flex flex-wrap gap-2';
            default:
                return 'flex space-x-2 overflow-x-auto pb-2';
        }
    };

    const getButtonClasses = (categoryId) => {
        const isSelected = selectedCategory === categoryId.toString();
        const baseClasses = 'transition-all duration-200 font-medium';

        switch (variant) {
            case 'vertical':
                return `${baseClasses} flex items-center gap-3 w-full p-3 rounded-lg text-left ${
                    isSelected
                        ? 'bg-primary-orange text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                }`;
            case 'pills':
                return `${baseClasses} inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    isSelected
                        ? 'bg-primary-orange text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`;
            default:
                return `${baseClasses} flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                    isSelected
                        ? 'bg-primary-orange text-white shadow-md'
                        : 'bg-white border border-gray-300 text-gray-700 hover:border-primary-orange hover:text-primary-orange'
                }`;
        }
    };

    return (
        <div className={getContainerClasses()}>
            {allCategories.map((category) => {
                const Icon = category.icon;
                const productCount = getProductCount(category.id);

                return (
                    <button
                        key={category.id}
                        onClick={() => onCategoryChange(category.id.toString())}
                        className={getButtonClasses(category.id)}
                        title={category.description || category.name}
                    >
                        {showIcons && <Icon className="w-4 h-4 flex-shrink-0" />}
                        <span className="truncate">{category.name}</span>
                        {showCount && productCount > 0 && (
                            <span className={`text-xs px-2 py-1 rounded-full ml-auto ${
                                selectedCategory === category.id.toString()
                                    ? 'bg-white bg-opacity-20'
                                    : 'bg-gray-200 text-gray-600'
                            }`}>
                {productCount}
              </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

// Componente específico para filtros horizontales con scroll
export const HorizontalCategoryFilter = (props) => (
    <CategoryFilter {...props} variant="horizontal" />
);

// Componente específico para sidebar vertical
export const VerticalCategoryFilter = (props) => (
    <CategoryFilter {...props} variant="vertical" />
);

// Componente específico para pills/tags
export const PillsCategoryFilter = (props) => (
    <CategoryFilter {...props} variant="pills" />
);

export default CategoryFilter;