import React from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import ProductCarousel from '../components/products/ProductCarousel';
import Container from '../components/common/Container';
import Loading from '../components/common/Loading';
import { ChefHat, Clock, Star, Phone, MapPin, ShoppingBag } from 'lucide-react';

const Home = () => {
    const { products, loading } = useProducts();
    const { user } = useAuth();

    const featuredProducts = products.filter(product => product.rating >= 4.5).slice(0, 6);
    const popularProducts = products.slice(0, 8);

    if (loading) return <Loading />;

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-primary-yellow to-primary-orange text-white py-20">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl font-bold mb-6 text-black">
                                ¡Bienvenido a <span className="text-primary-red">Cali Pollo</span>!
                            </h1>
                            <p className="text-xl mb-8 text-gray-dark">
                                El mejor pollo frito de Sabanalarga con sabor caribeño auténtico.
                                Crujiente por fuera, jugoso por dentro.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link
                                    to="/menu"
                                    className="bg-primary-red hover:bg-accent-red text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-center flex items-center justify-center gap-2"
                                >
                                    <ShoppingBag size={20} />
                                    Ver Menú
                                </Link>
                                {!user && (
                                    <Link
                                        to="/auth"
                                        className="border-2 border-white hover:bg-white hover:text-primary-orange text-white px-8 py-4 rounded-lg font-semibold transition-all duration-300 text-center"
                                    >
                                        Crear Cuenta
                                    </Link>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <img
                                src="/images/logo-cali-pollo.png"
                                alt="Cali Pollo Logo"
                                className="w-64 h-64 mx-auto mb-4 object-contain"
                            />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-light">
                <Container>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="bg-primary-yellow p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <ChefHat className="text-primary-red" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Receta Tradicional</h3>
                            <p className="text-gray-dark">
                                Pollo marinado con especias caribeñas y técnicas familiares
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary-orange p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Clock className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
                            <p className="text-gray-dark">
                                Recibe tu pedido en 30 minutos o menos
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="bg-primary-red p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Star className="text-white" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Calidad Garantizada</h3>
                            <p className="text-gray-dark">
                                Ingredientes frescos y preparación del momento
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Featured Products */}
            {featuredProducts.length > 0 && (
                <section className="py-16">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-dark mb-4">
                                Productos Destacados
                            </h2>
                            <p className="text-gray-medium text-lg">
                                Los favoritos de nuestros clientes
                            </p>
                        </div>
                        <ProductCarousel products={featuredProducts} />
                    </Container>
                </section>
            )}

            {/* Popular Products */}
            {popularProducts.length > 0 && (
                <section className="py-16 bg-secondary-yellow">
                    <Container>
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-dark mb-4">
                                Más Populares
                            </h2>
                            <p className="text-gray-medium text-lg">
                                Lo que más piden nuestros clientes
                            </p>
                        </div>
                        <ProductCarousel products={popularProducts} />
                        <div className="text-center mt-8">
                            <Link
                                to="/menu"
                                className="bg-primary-red hover:bg-accent-red text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 inline-flex items-center gap-2"
                            >
                                Ver Todo el Menú
                                <ShoppingBag size={18} />
                            </Link>
                        </div>
                    </Container>
                </section>
            )}

            {/* Contact Info */}
            <section className="py-16 bg-gray-dark text-white">
                <Container>
                    <div className="grid md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">¿Listo para ordenar?</h2>
                            <p className="text-lg mb-8">
                                Contactanos directamente o haz tu pedido en línea
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Phone className="text-primary-yellow" size={20} />
                                    <span>+57 300 123 4567</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="text-primary-yellow" size={20} />
                                    <span>Carrera 10 #15-25, Sabanalarga, Atlántico</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-semibold mb-4">Horarios de Atención</h3>
                            <div className="space-y-2 text-lg">
                                <p>Lunes a Jueves: 11:00 AM - 10:00 PM</p>
                                <p>Viernes a Domingo: 11:00 AM - 11:00 PM</p>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </div>
    );
};

export default Home;