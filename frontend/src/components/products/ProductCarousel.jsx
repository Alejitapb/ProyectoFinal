import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductCarousel = ({
                             title,
                             products = [],
                             onViewDetails,
                             autoSlide = false,
                             slideInterval = 5000,
                             showQuickAdd = true,
                             className = ''
                         }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(4);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const carouselRef = useRef(null);
    const autoSlideRef = useRef(null);

    // Calculate items per view based on screen size
    useEffect(() => {
        const calculateItemsPerView = () => {
            const width = window.innerWidth;
            if (width < 480) {
                setItemsPerView(1);
            } else if (width < 768) {
                setItemsPerView(2);
            } else if (width < 1024) {
                setItemsPerView(3);
            } else {
                setItemsPerView(4);
            }
        };

        calculateItemsPerView();
        window.addEventListener('resize', calculateItemsPerView);
        return () => window.removeEventListener('resize', calculateItemsPerView);
    }, []);

    // Auto slide functionality
    useEffect(() => {
        if (autoSlide && !isHovered && products.length > itemsPerView) {
            autoSlideRef.current = setInterval(() => {
                setCurrentIndex(prev => {
                    const maxIndex = products.length - itemsPerView;
                    return prev >= maxIndex ? 0 : prev + 1;
                });
            }, slideInterval);
        }

        return () => {
            if (autoSlideRef.current) {
                clearInterval(autoSlideRef.current);
            }
        };
    }, [autoSlide, isHovered, products.length, itemsPerView, slideInterval]);

    const maxIndex = Math.max(0, products.length - itemsPerView);

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : maxIndex));
    };

    const goToNext = () => {
        setCurrentIndex(prev => (prev < maxIndex ? prev + 1 : 0));
    };

    const goToSlide = (index) => {
        setCurrentIndex(Math.min(index, maxIndex));
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && currentIndex < maxIndex) {
            goToNext();
        }
        if (isRightSwipe && currentIndex > 0) {
            goToPrevious();
        }
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        if (isHovered) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isHovered, currentIndex, maxIndex]);

    if (!products || products.length === 0) {
        return (
            <div className={`product-carousel empty ${className}`}>
                {title && <h2 className="carousel-title">{title}</h2>}
                <div className="empty-state">
                    <p>No hay productos disponibles en este momento</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`product-carousel ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            ref={carouselRef}
        >
            {title && <h2 className="carousel-title">{title}</h2>}

            <div className="carousel-container">
                {/* Navigation Buttons */}
                {products.length > itemsPerView && (
                    <>
                        <button
                            className={`nav-btn prev-btn ${currentIndex === 0 ? 'disabled' : ''}`}
                            onClick={goToPrevious}
                            disabled={currentIndex === 0}
                            aria-label="Producto anterior"
                        >
                            <ChevronLeft size={24} />
                        </button>

                        <button
                            className={`nav-btn next-btn ${currentIndex >= maxIndex ? 'disabled' : ''}`}
                            onClick={goToNext}
                            disabled={currentIndex >= maxIndex}
                            aria-label="Siguiente producto"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Products Container */}
                <div
                    className="products-container"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="products-track"
                        style={{
                            transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                            width: `${(products.length / itemsPerView) * 100}%`
                        }}
                    >
                        {products.map((product, index) => (
                            <div
                                key={product.id || index}
                                className="product-slide"
                                style={{ width: `${100 / products.length}%` }}
                            >
                                <ProductCard
                                    product={product}
                                    onViewDetails={onViewDetails}
                                    showQuickAdd={showQuickAdd}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots Indicator */}
                {products.length > itemsPerView && (
                    <div className="dots-container">
                        {Array.from({ length: maxIndex + 1 }, (_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentIndex ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                                aria-label={`Ir a la página ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <style jsx>{`
        .product-carousel {
          position: relative;
          margin: 2rem 0;
        }

        .product-carousel.empty {
          text-align: center;
        }

        .carousel-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--black);
          margin: 0 0 1.5rem 0;
          text-align: center;
        }

        .carousel-container {
          position: relative;
          overflow: hidden;
          border-radius: 1rem;
        }

        .nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.95);
          border: 2px solid var(--primary-orange);
          color: var(--primary-orange);
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          opacity: 0;
          visibility: hidden;
        }

        .product-carousel:hover .nav-btn:not(.disabled) {
          opacity: 1;
          visibility: visible;
        }

        .nav-btn:hover:not(.disabled) {
          background: var(--primary-orange);
          color: white;
          transform: translateY(-50%) scale(1.1);
        }

        .nav-btn.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .prev-btn {
          left: 1rem;
        }

        .next-btn {
          right: 1rem;
        }

        .products-container {
          overflow: hidden;
          position: relative;
        }

        .products-track {
          display: flex;
          transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .product-slide {
          flex-shrink: 0;
          padding: 0 0.5rem;
        }

        .dots-container {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid var(--gray-medium);
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot.active {
          background: var(--primary-orange);
          border-color: var(--primary-orange);
        }

        .dot:hover {
          border-color: var(--primary-orange);
          transform: scale(1.2);
        }

        .empty-state {
          padding: 3rem 1rem;
          color: var(--gray-dark);
        }

        .empty-state p {
          margin: 0;
          font-size: 1.1rem;
        }

        /* Mobile Styles */
        @media (max-width: 768px) {
          .carousel-title {
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .nav-btn {
            width: 40px;
            height: 40px;
            opacity: 1;
            visibility: visible;
          }

          .prev-btn {
            left: 0.5rem;
          }

          .next-btn {
            right: 0.5rem;
          }

          .product-slide {
            padding: 0 0.25rem;
          }

          .dots-container {
            margin-top: 1rem;
          }

          .dot {
            width: 10px;
            height: 10px;
          }
        }

        @media (max-width: 480px) {
          .carousel-title {
            font-size: 1.25rem;
          }

          .nav-btn {
            width: 36px;
            height: 36px;
          }

          .nav-btn svg {
            width: 20px;
            height: 20px;
          }
        }

        /* Animation for auto-slide */
        @media (prefers-reduced-motion: reduce) {
          .products-track {
            transition: none;
          }
        }

        /* Focus styles for accessibility */
        .nav-btn:focus,
        .dot:focus {
          outline: 2px solid var(--primary-orange);
          outline-offset: 2px;
        }

        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .nav-btn {
            border-width: 3px;
          }
          
          .dot {
            border-width: 3px;
          }
        }
      `}</style>
        </div>
    );
};

export default ProductCarousel;