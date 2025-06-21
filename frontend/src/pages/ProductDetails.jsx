import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import Container from '../components/common/Container';
import Loading from '../components/common/Loading';
import StarRating from '../components/reviews/StarRating';
import ReviewsList from '../components/reviews/ReviewsList';
import ReviewForm from '../components/reviews/ReviewForm';
import ProductCarousel from '../components/products/ProductCarousel';
import {
    ShoppingCart,
    Heart,
    Share2,
    Clock,
    ChefHat,
    Info,
    ArrowLeft,
    Plus,
    Minus
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, getProductById, loading } = useProducts();
    const { addToCart } = useCart();
    const { user } = useAuth();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            if (id) {
                const productData = await getProductById(parseInt(id));
                setProduct(productData);

                // Get related products from same category
                if (productData && products.length > 0) {
                    const related = products
                        .filter(p => p.category_id === productData.category_id && p.id !== productData.id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                }
            }
        };

        fetchProduct();
    }, [id, getProductById, products]);

    const handleAddToCart = () => {
        if (!product) return;

        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }

        toast.success(`${quantity} ${product.name}${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''} al carrito`);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const handleShare = async () => {
        if (navigator.share && product) {
            try {
                await navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href,
                });
            } catch (error) {
                // Fallback to clipboard
                navigator.clipboard.writeText(window.location.href);
                toast.success('Enlace copiado al portapapeles');
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            toast.success('Enlace copiado al portapapeles');
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(price);
    };

    if (loading) return <Loading />;

    if (!product) {
        return (
            <Container>
                <div className="text-center py-12">
                    <p className="text-gray-medium text-lg">Producto no encontrado</p>
                    <button
                        onClick={() => navigate('/menu')}
                        className="mt-4 bg-primary-orange text-white px-6 py-2 rounded-lg hover:bg-primary-red transition-colors"
                    >
                        Ver Menú
                    </button>
                </div>
            </Container>
        );
    }

    return (
        <div className="min-h-screen bg-gray-light">
            <Container>
                <div className="py-8">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-dark hover:text-primary-orange mb-6 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Volver
                    </button>

                    {/* Product Details */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Product Image */}
                            <div className="relative">
                                <img
                                    src={product.image_url || '/images/placeholder-food.jpg'}
                                    alt={product.name}
                                    className="w-full h-96 lg:h-full object-cover"
                                />
                                {!product.is_available && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
                      No Disponible
                    </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-4">
                                    <h1 className="text-3xl font-bold text-gray-dark">{product.name}</h1>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsFavorite(!isFavorite)}
                                            className={`p-2 rounded-full transition-colors ${
                                                isFavorite
                                                    ? 'bg-red-100 text-red-500'
                                                    : 'bg-gray-light text-gray-medium hover:bg-red-100 hover:text-red-500'
                                            }`}
                                        >
                                            <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
                                        </button>
                                        <button
                                            onClick={handleShare}
                                            className="p-2 rounded-full bg-gray-light text-gray-medium hover:bg-primary-yellow hover:text-primary-orange transition-colors"
                                        >
                                            <Share2 size={20} />
                                        </button>
                                    </div>
                                </div>

                                {/* Rating */}
                                <div className="flex items-center gap-2 mb-4">
                                    <StarRating rating={product.rating} size={20} />
                                    <span className="text-gray-medium">
                    ({product.total_reviews} reseña{product.total_reviews !== 1 ? 's' : ''})
                  </span>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                  <span className="text-3xl font-bold text-primary-red">
                    {formatPrice(product.price)}
                  </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-dark mb-6 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Product Details */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-primary-orange" size={20} />
                                        <span className="text-sm text-gray-dark">
                      {product.preparation_time} min
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChefHat className="text-primary-orange" size={20} />
                                        <span className="text-sm text-gray-dark">
                      Hecho al momento
                    </span>
                                    </div>
                                </div>

                                {/* Ingredients */}
                                {product.ingredients && (
                                    <div className="mb-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Info className="text-primary-orange" size={20} />
                                            <h3 className="font-semibold text-gray-dark">Ingredientes</h3>
                                        </div>
                                        <p className="text-sm text-gray-medium">
                                            {product.ingredients}
                                        </p>
                                    </div>
                                )}

                                {/* Quantity and Add to Cart */}
                                {product.is_available && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-medium rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(-1)}
                                                className="p-2 hover:bg-gray-light transition-colors"
                                                disabled={quantity <= 1}
                                            >
                                                <Minus size={16} />
                                            </button>
                                            <span className="px-4 py-2 min-w-[3rem] text-center">
                        {quantity}
                      </span>
                                            <button
                                                onClick={() => handleQuantityChange(1)}
                                                className="p-2 hover:bg-gray-light transition-colors"
                                                disabled={quantity >= 10}
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleAddToCart}
                                            className="flex-1 bg-primary-red hover:bg-accent-red text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ShoppingCart size={20} />
                                            Agregar al Carrito - {formatPrice(product.price * quantity)}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reviews Section */}
                    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-dark">
                                Reseñas ({product.total_reviews})
                            </h2>
                            {user && (
                                <button
                                    onClick={() => setShowReviewForm(!showReviewForm)}
                                    className="bg-primary-orange text-white px-4 py-2 rounded-lg hover:bg-primary-red transition-colors"
                                >
                                    {showReviewForm ? 'Cancelar' : 'Escribir Reseña'}
                                </button>
                            )}
                        </div>

                        {showReviewForm && user && (
                            <div className="mb-8">
                                <ReviewForm
                                    productId={product.id}
                                    onSubmit={() => setShowReviewForm(false)}
                                />
                            </div>
                        )}

                        <ReviewsList productId={product.id} />
                    </div>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="bg-white rounded-lg shadow-md p-8">
                            <h2 className="text-2xl font-bold text-gray-dark mb-6">
                                Productos Relacionados
                            </h2>
                            <ProductCarousel products={relatedProducts} />
                        </div>
                    )}
                </div>
            </Container>
        </div>
    );
};

export default ProductDetails;