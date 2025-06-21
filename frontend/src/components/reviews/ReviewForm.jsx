import React, { useState, useEffect } from 'react';
import { Star, Send, X, Image, Smile } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { reviewsService as reviewsApi } from '../../services/reviews';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

const ReviewForm = ({
                        productId = null,
                        orderId = null,
                        onSubmit = null,
                        onCancel = null,
                        initialData = null
                    }) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        rating: initialData?.rating || 0,
        comment: initialData?.comment || '',
        product_id: productId || initialData?.product_id || '',
        order_id: orderId || initialData?.order_id || ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [showEmojiSuggestions, setShowEmojiSuggestions] = useState(false);

    const emojiSuggestions = {
        1: ['😞', '😢', '😤', '👎', '😠'],
        2: ['😕', '🙁', '😐', '😒', '😑'],
        3: ['😐', '🤔', '😊', '👌', '😌'],
        4: ['😊', '👍', '😋', '🙂', '✨'],
        5: ['🤩', '😍', '🥰', '🔥', '💯', '👏', '🎉']
    };

    useEffect(() => {
        if (!user) {
            toast.error('Debes iniciar sesión para dejar una reseña');
        }
    }, [user]);

    const validateForm = () => {
        const newErrors = {};

        if (formData.rating === 0) {
            newErrors.rating = 'Debes seleccionar una calificación';
        }

        if (formData.rating < 1 || formData.rating > 5) {
            newErrors.rating = 'La calificación debe estar entre 1 y 5 estrellas';
        }

        if (!formData.comment.trim()) {
            newErrors.comment = 'El comentario es obligatorio';
        } else if (formData.comment.trim().length < 10) {
            newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
        } else if (formData.comment.trim().length > 500) {
            newErrors.comment = 'El comentario no puede exceder 500 caracteres';
        }

        if (!productId && !formData.product_id) {
            newErrors.product_id = 'Debes seleccionar un producto';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRatingChange = (rating) => {
        setFormData(prev => ({ ...prev, rating }));
        setErrors(prev => ({ ...prev, rating: null }));
        setShowEmojiSuggestions(true);

        // Auto-hide emoji suggestions after 3 seconds
        setTimeout(() => {
            setShowEmojiSuggestions(false);
        }, 3000);
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, comment: value }));
        setErrors(prev => ({ ...prev, comment: null }));
    };

    const addEmoji = (emoji) => {
        setFormData(prev => ({
            ...prev,
            comment: prev.comment + emoji
        }));
        setShowEmojiSuggestions(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Debes iniciar sesión para dejar una reseña');
            return;
        }

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const reviewData = {
                ...formData,
                comment: formData.comment.trim()
            };

            let response;
            if (initialData?.id) {
                // Actualizar reseña existente
                response = await reviewsApi.updateReview(initialData.id, reviewData);
                toast.success('Reseña actualizada exitosamente');
            } else {
                // Crear nueva reseña
                response = await reviewsApi.createReview(reviewData);
                toast.success('¡Gracias por tu reseña!');
            }

            if (onSubmit) {
                onSubmit(response.data);
            }

            // Limpiar formulario si es una nueva reseña
            if (!initialData?.id) {
                setFormData({
                    rating: 0,
                    comment: '',
                    product_id: productId || '',
                    order_id: orderId || ''
                });
            }

        } catch (error) {
            console.error('Error submitting review:', error);
            const errorMessage = error.response?.data?.message || 'Error al enviar la reseña';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getRatingText = (rating) => {
        const texts = {
            1: 'Muy malo',
            2: 'Malo',
            3: 'Regular',
            4: 'Bueno',
            5: 'Excelente'
        };
        return texts[rating] || '';
    };

    if (!user) {
        return (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Inicia sesión para dejar una reseña
                </h3>
                <p className="text-gray-500 mb-4">
                    Comparte tu experiencia con otros clientes
                </p>
                <button
                    onClick={() => window.location.href = '/login'}
                    className="bg-primary-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                    Iniciar sesión
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">
                    {initialData?.id ? 'Editar reseña' : 'Escribir reseña'}
                </h3>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Calificación */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calificación *
                    </label>
                    <div className="flex items-center space-x-4">
                        <StarRating
                            rating={formData.rating}
                            interactive={true}
                            onChange={handleRatingChange}
                            size="lg"
                        />
                        {formData.rating > 0 && (
                            <span className="text-lg font-medium text-gray-700">
                {getRatingText(formData.rating)}
              </span>
                        )}
                    </div>
                    {errors.rating && (
                        <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                    )}
                </div>

                {/* Sugerencias de emojis */}
                {showEmojiSuggestions && formData.rating > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                            <Smile className="w-5 h-5 text-yellow-600 mr-2" />
                            <span className="text-sm font-medium text-yellow-800">
                Añade emojis a tu comentario:
              </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {emojiSuggestions[formData.rating]?.map((emoji, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => addEmoji(emoji)}
                                    className="text-2xl hover:bg-yellow-100 rounded p-1 transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Comentario */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Comentario *
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={handleCommentChange}
                        placeholder="Cuéntanos sobre tu experiencia con este producto..."
                        rows={4}
                        maxLength={500}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-orange focus:border-transparent resize-none ${
                            errors.comment ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.comment ? (
                            <p className="text-sm text-red-600">{errors.comment}</p>
                        ) : (
                            <p className="text-sm text-gray-500">
                                Mínimo 10 caracteres
                            </p>
                        )}
                        <span className={`text-sm ${
                            formData.comment.length > 450 ? 'text-red-500' : 'text-gray-400'
                        }`}>
              {formData.comment.length}/500
            </span>
                    </div>
                </div>

                {/* Información del usuario */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-orange rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name?.charAt(0).toUpperCase()}
              </span>
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{user.name}</p>
                            <p className="text-sm text-gray-500">
                                Se publicará como {user.name}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading || formData.rating === 0}
                        className="bg-primary-orange text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                            <Send className="w-5 h-5 mr-2" />
                        )}
                        {loading ? 'Enviando...' : (initialData?.id ? 'Actualizar' : 'Publicar reseña')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;