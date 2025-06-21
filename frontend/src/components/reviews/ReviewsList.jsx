import React, { useState, useEffect } from 'react';
import { Star, Filter, ChevronDown, MessageSquare, ThumbsUp, Flag } from 'lucide-react';
import ReviewItem from './ReviewItem';
import { reviewsService } from '../../services/reviews';

const ReviewsList = ({ productId, showAddReview = true, limit = null }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [showFilters, setShowFilters] = useState(false);
    const [stats, setStats] = useState({
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        loadReviews();
    }, [productId, filter, sortBy]);

    const loadReviews = async () => {
        try {
            setLoading(true);
            const data = await reviewsService.getReviews(productId, {
                filter,
                sortBy,
                limit
            });
            setReviews(data.reviews);
            setStats(data.stats);
        } catch (err) {
            setError('Error al cargar las reseñas');
            console.error('Error loading reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReviewUpdate = (reviewId, action) => {
        setReviews(prev => prev.map(review => {
            if (review.id === reviewId) {
                switch (action) {
                    case 'like':
                        return { ...review, likes: (review.likes || 0) + 1, userLiked: true };
                    case 'unlike':
                        return { ...review, likes: Math.max((review.likes || 0) - 1, 0), userLiked: false };
                    case 'report':
                        return { ...review, reported: true };
                    default:
                        return review;
                }
            }
            return review;
        }));
    };

    const filterOptions = [
        { value: 'all', label: 'Todas las reseñas' },
        { value: '5', label: '5 estrellas' },
        { value: '4', label: '4 estrellas' },
        { value: '3', label: '3 estrellas' },
        { value: '2', label: '2 estrellas' },
        { value: '1', label: '1 estrella' },
        { value: 'with_photos', label: 'Con fotos' },
        { value: 'verified', label: 'Compras verificadas' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Más recientes' },
        { value: 'oldest', label: 'Más antiguas' },
        { value: 'highest', label: 'Calificación alta' },
        { value: 'lowest', label: 'Calificación baja' },
        { value: 'helpful', label: 'Más útiles' }
    ];

    const renderStarDistribution = () => {
        const maxCount = Math.max(...Object.values(stats.distribution));

        return (
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Average rating */}
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-800 mb-1">
                            {stats.average.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`w-5 h-5 ${
                                        star <= Math.round(stats.average)
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                        <div className="text-sm text-gray-600">
                            {stats.total} reseñas
                        </div>
                    </div>

                    {/* Rating distribution */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.distribution[rating] || 0;
                            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

                            return (
                                <div key={rating} className="flex items-center gap-2 text-sm">
                                    <span className="w-8 text-right">{rating}</span>
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="w-8 text-gray-600">{count}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-4 animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-16 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <MessageSquare className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                    onClick={loadReviews}
                    className="mt-2 text-red-600 hover:text-red-800 font-medium"
                >
                    Intentar nuevamente
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            {stats.total > 0 && renderStarDistribution()}

            {/* Filters and sorting */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-semibold text-gray-800">
                    Reseñas ({stats.total})
                </h3>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Filter className="w-4 h-4" />
                        Filtros
                        <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </button>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Filter options */}
            {showFilters && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {filterOptions.map(option => (
                            <button
                                key={option.value}
                                onClick={() => setFilter(option.value)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    filter === option.value
                                        ? 'bg-yellow-500 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Reviews list */}
            {reviews.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                        No hay reseñas todavía
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Sé el primero en compartir tu experiencia
                    </p>
                    {showAddReview && (
                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg transition-colors">
                            Escribir reseña
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <ReviewItem
                            key={review.id}
                            review={review}
                            onUpdate={handleReviewUpdate}
                        />
                    ))}

                    {/* Load more button */}
                    {!limit && reviews.length < stats.total && (
                        <div className="text-center pt-4">
                            <button
                                onClick={() => {/* Load more logic */}}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                            >
                                Cargar más reseñas
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewsList;