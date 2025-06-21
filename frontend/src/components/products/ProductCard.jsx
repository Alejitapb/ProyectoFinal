import React, { useState } from 'react';
import { Star, Plus, Minus, ShoppingCart, Clock, Heart } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/helpers';

const ProductCard = ({
                         product,
                         onViewDetails,
                         isCompact = false,
                         showQuickAdd = true
                     }) => {
    const { addToCart, getItemQuantity, updateQuantity } = useCart();
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const currentQuantity = getItemQuantity(product.id);

    const handleQuickAdd = async (e) => {
        e.stopPropagation();
        setIsAdding(true);

        try {
            await addToCart(product, 1);
        } catch (error) {
            console.error('Error al agregar al carrito:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleQuantityChange = (e, newQuantity) => {
        e.stopPropagation();
        updateQuantity(product.id, newQuantity);
    };

    const handleFavoriteToggle = (e) => {
        e.stopPropagation();
        setIsFavorite(!isFavorite);
        // Aquí podrías agregar lógica para guardar favoritos
    };

    const handleCardClick = () => {
        if (onViewDetails) {
            onViewDetails(product);
        }
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 0; i < fullStars; i++) {
            stars.push(
                <Star key={i} size={14} className="star filled" />
            );
        }

        if (hasHalfStar) {
            stars.push(
                <Star key="half" size={14} className="star half-filled" />
            );
        }

        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(
                <Star key={`empty-${i}`} size={14} className="star empty" />
            );
        }

        return stars;
    };

    return (
        <div
            className={`product-card ${isCompact ? 'compact' : ''} ${!product.is_available ? 'unavailable' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleCardClick}
        >
            <div className="product-image-container">
                <img
                    src={product.image_url || '/images/placeholder-food.jpg'}
                    alt={product.name}
                    className="product-image"
                    loading={isCompact ? 'eager' : 'lazy'}
                />

                {!product.is_available && (
                    <div className="unavailable-overlay">
                        <span>No disponible</span>
                    </div>
                )}

                <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteToggle}
                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                    <Heart size={16} />
                </button>

                {product.preparation_time && (
                    <div className="preparation-time">
                        <Clock size={12} />
                        <span>{product.preparation_time} min</span>
                    </div>
                )}
            </div>

            <div className="product-info">
                <div className="product-header">
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price">{formatPrice(product.price)}</div>
                </div>

                {!isCompact && (
                    <>
                        <p className="product-description">
                            {product.description}
                        </p>

                        {product.ingredients && (
                            <p className="product-ingredients">
                                <strong>Ingredientes:</strong> {product.ingredients}
                            </p>
                        )}
                    </>
                )}

                <div className="product-rating">
                    <div className="stars">
                        {renderStars(product.rating || 0)}
                    </div>
                    <span className="rating-text">
            {product.rating ? product.rating.toFixed(1) : '0.0'}
                        ({product.total_reviews || 0} reseñas)
          </span>
                </div>

                {product.is_available && showQuickAdd && (
                    <div className="product-actions">
                        {currentQuantity > 0 ? (
                            <div className="quantity-controls">
                                <button
                                    className="quantity-btn"
                                    onClick={(e) => handleQuantityChange(e, currentQuantity - 1)}
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="quantity">{currentQuantity}</span>
                                <button
                                    className="quantity-btn"
                                    onClick={(e) => handleQuantityChange(e, currentQuantity + 1)}
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ) : (
                            <button
                                className="add-to-cart-btn"
                                onClick={handleQuickAdd}
                                disabled={isAdding}
                            >
                                <ShoppingCart size={16} />
                                {isAdding ? 'Agregando...' : 'Agregar'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .product-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .product-card.unavailable {
          opacity: 0.7;
        }

        .product-card.compact {
          flex-direction: row;
          height: auto;
          max-height: 120px;
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
        }

        .compact .product-image-container {
          width: 120px;
          height: 100%;
          flex-shrink: 0;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .unavailable-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
        }

        .favorite-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--gray-dark);
        }

        .favorite-btn:hover,
        .favorite-btn.active {
          background: var(--accent-red);
          color: white;
        }

        .preparation-time {
          position: absolute;
          bottom: 0.75rem;
          left: 0.75rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .product-info {
          padding: 1rem;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .compact .product-info {
          padding: 0.75rem;
          gap: 0.5rem;
        }

        .product-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .product-name {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--black);
          line-height: 1.3;
          flex: 1;
        }

        .compact .product-name {
          font-size: 0.95rem;
        }

        .product-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary-orange);
          white-space: nowrap;
        }

        .compact .product-price {
          font-size: 1rem;
        }

        .product-description {
          margin: 0;
          font-size: 0.875rem;
          color: var(--gray-dark);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-ingredients {
          margin: 0;
          font-size: 0.8rem;
          color: var(--gray-dark);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .stars {
          display: flex;
          gap: 0.125rem;
        }

        .star {
          color: var(--gray-medium);
        }

        .star.filled {
          color: var(--primary-yellow);
        }

        .star.half-filled {
          color: var(--primary-yellow);
          opacity: 0.5;
        }

        .rating-text {
          color: var(--gray-dark);
          font-size: 0.75rem;
        }

        .compact .rating-text {
          display: none;
        }

        .product-actions {
          margin-top: auto;
        }

        .add-to-cart-btn {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary-orange);
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .add-to-cart-btn:hover:not(:disabled) {
          background: var(--accent-red);
          transform: translateY(-1px);
        }

        .add-to-cart-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.5rem;
          background: var(--secondary-orange);
          border-radius: 0.5rem;
        }

        .quantity-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--primary-orange);
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .quantity-btn:hover {
          background: var(--accent-red);
          transform: scale(1.1);
        }

        .quantity {
          font-weight: 700;
          font-size: 1rem;
          color: var(--black);
          min-width: 2rem;
          text-align: center;
        }

        @media (max-width: 768px) {
          .product-card {
            border-radius: 0.75rem;
          }

          .product-image-container {
            height: 160px;
          }

          .product-info {
            padding: 0.75rem;
          }

          .product-name {
            font-size: 1rem;
          }

          .product-price {
            font-size: 1rem;
          }

          .add-to-cart-btn {
            padding: 0.625rem;
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .compact {
            flex-direction: column;
            max-height: none;
          }

          .compact .product-image-container {
            width: 100%;
            height: 120px;
          }

          .compact .rating-text {
            display: inline;
            font-size: 0.7rem;
          }
        }
      `}</style>
        </div>
    );
};

export default ProductCard;