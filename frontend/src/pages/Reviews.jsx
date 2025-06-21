import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import ReviewsList from '../components/reviews/ReviewsList';
import ReviewForm from '../components/reviews/ReviewForm';
import StarRating from '../components/reviews/StarRating';
import { Star, MessageSquare, Filter, Plus } from 'lucide-react';
import Loading from '../components/common/Loading';
import toast from 'react-hot-toast';
import { reviewsService } from '../services/reviews';

const Reviews = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [userReviews, setUserReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [filterRating, setFilterRating] = useState('all');
    const [stats, setStats] = useState({
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    });

    useEffect(() => {
        fetchReviews();
        if (user) {
            fetchUserReviews();
        }
    }, [user]);

    const fetchReviews = async () => {
        try {
            const data = await reviewsService.getAllReviews();
            setReviews(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Error al cargar las reseñas');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserReviews = async () => {
        try {
            const data = await reviewsService.getUserReviews();
            setUserReviews(data);
        } catch (error) {
            console.error('Error fetching user reviews:', error);
        }
    };

    const calculateStats = (reviewsData) => {
        if (!reviewsData || reviewsData.length === 0) {
            setStats({
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            });
            return;
        }

        const totalReviews = reviewsData.length;
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / totalReviews;

        const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsData.forEach(review => {
            ratingDistribution[review.rating]++;
        });

        setStats({
            totalReviews,
            averageRating,
            ratingDistribution
        });
    };

    const handleReviewSubmitted = () => {
        setShowForm(false);
        fetchReviews();
        if (user) {
            fetchUserReviews();
        }
        toast.success('Reseña enviada correctamente');
    };

    const getFilteredReviews = () => {
        const currentReviews = activeTab === 'all' ? reviews : userReviews;

        if (filterRating === 'all') {
            return currentReviews;
        }

        return currentReviews.filter(review => review.rating === parseInt(filterRating));
    };

    const getRatingPercentage = (rating) => {
        if (stats.totalReviews === 0) return 0;
        return (stats.ratingDistribution[rating] / stats.totalReviews) * 100;
    };

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                Reseñas y Calificaciones
                            </h1>
                            <p className="text-gray-600">
                                Conoce lo que opinan nuestros clientes sobre nuestros productos
                            </p>
                        </div>
                        {user && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="mt-4 md:mt-0 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Escribir Reseña</span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                    {/* Sidebar con estadísticas */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Resumen de calificaciones */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">
                                Calificación General
                            </h2>

                            <div className="text-center mb-6">
                                <div className="text-4xl font-bold text-yellow-600 mb-2">
                                    {stats.averageRating.toFixed(1)}
                                </div>
                                <StarRating rating={stats.averageRating} size="lg" />
                                <p className="text-sm text-gray-600 mt-2">
                                    Basado en {stats.totalReviews} reseña{stats.totalReviews !== 1 ? 's' : ''}
                                </p>
                            </div>

                            {/* Distribución de calificaciones */}
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center space-x-2 text-sm">
                                        <span className="w-3 text-gray-600">{rating}</span>
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${getRatingPercentage(rating)}%` }}
                                            />
                                        </div>
                                        <span className="w-8 text-gray-600 text-right">
                      {stats.ratingDistribution[rating]}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filtros */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                <Filter size={20} className="mr-2" />
                                Filtros
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Calificación
                                    </label>
                                    <select
                                        value={filterRating}
                                        onChange={(e) => setFilterRating(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    >
                                        <option value="all">Todas las calificaciones</option>
                                        <option value="5">5 estrellas</option>
                                        <option value="4">4 estrellas</option>
                                        <option value="3">3 estrellas</option>
                                        <option value="2">2 estrellas</option>
                                        <option value="1">1 estrella</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contenido principal */}
                    <div className="lg:col-span-3">
                        {/* Tabs */}
                        <div className="bg-white rounded-lg shadow-sm mb-6">
                            <div className="border-b">
                                <nav className="flex space-x-8 px-6">
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'all'
                                                ? 'border-yellow-500 text-yellow-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <MessageSquare size={16} />
                                            <span>Todas las Reseñas</span>
                                        </div>
                                    </button>
                                    {user && (
                                        <button
                                            onClick={() => setActiveTab('mine')}
                                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                                activeTab === 'mine'
                                                    ? 'border-yellow-500 text-yellow-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <Star size={16} />
                                                <span>Mis Reseñas</span>
                                            </div>
                                        </button>
                                    )}
                                </nav>
                            </div>
                        </div>

                        {/* Lista de reseñas */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <ReviewsList
                                reviews={getFilteredReviews()}
                                emptyMessage={
                                    activeTab === 'mine'
                                        ? "No has escrito ninguna reseña aún"
                                        : "No hay reseñas disponibles"
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Modal de formulario de reseña */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">
                                        Escribir Reseña
                                    </h2>
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <span className="sr-only">Cerrar</span>
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <ReviewForm
                                    onSubmit={handleReviewSubmitted}
                                    onCancel={() => setShowForm(false)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Mensaje para usuarios no autenticados */}
                {!user && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                        <div className="flex items-center">
                            <Star className="text-yellow-400 mr-2" size={24} />
                            <div>
                                <h3 className="font-medium text-yellow-800">
                                    ¿Quieres escribir una reseña?
                                </h3>
                                <p className="text-yellow-700 text-sm">
                                    Inicia sesión para compartir tu experiencia con otros clientes.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reviews;