import React, { useState } from 'react';
import {
    Star,
    ThumbsUp,
    Flag,
    MoreHorizontal,
    Calendar,
    CheckCircle,
    Image as ImageIcon,
    User
} from 'lucide-react';
import StarRating from './StarRating';

const ReviewItem = ({ review, onUpdate, showActions = true }) => {
    const [showFullComment, setShowFullComment] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [imageError, setImageError] = useState(false);

    const handleLike = async () => {
        try {
            if (review.userLiked) {
                onUpdate(review.id, 'unlike');
            } else {
                onUpdate(review.id, 'like');
            }
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleReport = async () => {
        try {
            if (confirm('¿Estás seguro de que quieres reportar esta reseña?')) {
                onUpdate(review.id, 'report');
                setShowMenu(false);
            }
        } catch (error) {
            console.error('Error reporting review:', error);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Hace 1 día';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
        if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;

        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const shouldTruncate = review.comment && review.comment.length > 200;
    const displayComment = shouldTruncate && !showFullComment
        ? review.comment.substring(0, 200) + '...'
        : review.comment;

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    {/* User avatar */}
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        {review.user_avatar ? (
                            <img
                                src={review.user_avatar}
                                alt={review.user_name}
                                className="w-10 h-10 rounded-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <User className="w-5 h-5 text-yellow-600" />
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* User info and rating */}
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-800 truncate">
                                {review.user_name}
                            </h4>
                            {review.verified_purchase && (
                                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                    <CheckCircle className="w-3 h-3" />
                                    Compra verificada
                                </div>
                            )}
                        </div>

                        {/* Rating and date */}
                        <div className="flex items-center gap-3 mb-2">
                            <StarRating rating={review.rating} size="sm" showValue={false} />
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Calendar className="w-3 h-3" />
                                {formatDate(review.created_at)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Menu */}
                {showActions && (
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                                <button
                                    onClick={handleReport}
                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <Flag className="w-3 h-3" />
                                    Reportar
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Comment */}
            {review.comment && (
                <div className="mb-3">
                    <p className="text-gray-700 leading-relaxed">
                        {displayComment}
                    </p>
                    {shouldTruncate && (
                        <button
                            onClick={() => setShowFullComment(!showFullComment)}
                            className="text-yellow-600 hover:text-yellow-700 text-sm font-medium mt-1"
                        >
                            {showFullComment ? 'Ver menos' : 'Ver más'}
                        </button>
                    )}
                </div>
            )}

            {/* Images */}
            {review.images && review.images.length > 0 && (
                <div className="mb-3">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {review.images.map((image, index) => (
                            <div
                                key={index}
                                className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                            >
                                <img
                                    src={image.url}
                                    alt={`Imagen ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onClick={() => {
                                        // Open image modal or gallery
                                        console.log('Open image:', image.url);
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Product info (if multiple products) */}
            {review.product_name && (
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        Producto: <span className="font-medium text-gray-800">{review.product_name}</span>
                    </p>
                </div>
            )}

            {/* Admin response */}
            {review.admin_response && (
                <div className="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">CP</span>
                        </div>
                        <span className="text-sm font-medium text-yellow-800">
              Respuesta de Cali Pollo
            </span>
                    </div>
                    <p className="text-sm text-yellow-700 leading-relaxed">
                        {review.admin_response}
                    </p>
                </div>
            )}

            {/* Actions */}
            {showActions && (
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <button
                        onClick={handleLike}
                        disabled={review.reported}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-colors ${
                            review.userLiked
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-gray-600 hover:bg-gray-100'
                        } ${review.reported ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <ThumbsUp className={`w-4 h-4 ${review.userLiked ? 'fill-current' : ''}`} />
                        <span>Útil</span>
                        {review.likes > 0 && (
                            <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {review.likes}
              </span>
                        )}
                    </button>

                    {review.reported && (
                        <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-full">
              Reportada
            </span>
                    )}
                </div>
            )}

            {/* Click outside to close menu */}
            {showMenu && (
                <div
                    className="fixed inset-0 z-5"
                    onClick={() => setShowMenu(false)}
                />
            )}
        </div>
    );
};

export default ReviewItem;