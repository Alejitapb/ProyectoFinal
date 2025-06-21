// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
//
// // Providers
// import { AuthProvider } from './context/AuthContext';
// import { ProductProvider } from './context/ProductContext';
// import { CartProvider } from './context/CartContext';
//
// // Components
// import Header from './components/common/Header';
// import Footer from './components/common/Footer';
// import Loading from './components/common/Loading';
//
// // Pages
// import Home from './pages/Home';
// import Menu from './pages/Menu';
// import ProductDetails from './pages/ProductDetails';
// import Cart from './pages/Cart';
// import Checkout from './pages/Checkout';
// import OrderConfirmation from './pages/OrderConfirmation';
// import Profile from './pages/Profile';
// import Reviews from './pages/Reviews';
// import Admin from './pages/Admin';
// import Support from './pages/Support';
//
// // Hook
// import { useAuth } from './hooks/useAuth';
//
// // Ruta protegida
// const ProtectedRoute = ({ children, adminOnly = false }) => {
//     const { user, loading } = useAuth();
//
//     if (loading) return <Loading />;
//
//     if (!user) return <Navigate to="/" replace />;
//
//     if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
//
//     return children;
// };
//
// function App() {
//     return (
//         <AuthProvider>
//             <ProductProvider>
//                 <CartProvider>
//                     <Router>
//                         <Header />
//                         <main className="flex-1">
//                             <Routes>
//                                 {/* Públicas */}
//                                 <Route path="/" element={<Home />} />
//                                 <Route path="/menu" element={<Menu />} />
//                                 <Route path="/product/:id" element={<ProductDetails />} />
//                                 <Route path="/reviews" element={<Reviews />} />
//                                 <Route path="/support" element={<Support />} />
//
//                                 {/* Protegidas */}
//                                 <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
//                                 <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
//                                 <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
//                                 <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
//
//                                 {/* Admin */}
//                                 <Route path="/admin/*" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
//
//                                 {/* Catch-all */}
//                                 <Route path="*" element={<Navigate to="/" replace />} />
//                             </Routes>
//                         </main>
//                         <Footer />
//
//                         <Toaster
//                             position="top-right"
//                             toastOptions={{
//                                 duration: 4000,
//                                 style: {
//                                     background: '#FFF8DC',
//                                     color: '#FF4500',
//                                     border: '2px solid #FFD700',
//                                     borderRadius: '8px',
//                                     fontWeight: '500',
//                                 },
//                                 success: {
//                                     iconTheme: {
//                                         primary: '#FFD700',
//                                         secondary: '#FFF8DC',
//                                     },
//                                 },
//                                 error: {
//                                     iconTheme: {
//                                         primary: '#DC143C',
//                                         secondary: '#FFF8DC',
//                                     },
//                                 },
//                             }}
//                         />
//                     </Router>
//                 </CartProvider>
//             </ProductProvider>
//         </AuthProvider>
//     );
// }
//
// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';

// Components
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

// Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import Reviews from './pages/Reviews';
import Admin from './pages/Admin';
import Support from './pages/Support';

// Hooks
import { useAuth } from './hooks/useAuth';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) return <Loading />;

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

// Layout Component
const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-light">
            <Header />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ProductProvider>
                <CartProvider>
                    <Router>
                        <Layout>
                            <Routes>
                                {/* Public Routes */}
                                <Route path="/" element={<Home />} />
                                <Route path="/menu" element={<Menu />} />
                                <Route path="/product/:id" element={<ProductDetails />} />
                                <Route path="/reviews" element={<Reviews />} />
                                <Route path="/support" element={<Support />} />
                                {/* Protected Routes */}
                                <Route
                                    path="/cart"
                                    element={
                                        <ProtectedRoute>
                                            <Cart />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/checkout"
                                    element={
                                        <ProtectedRoute>
                                            <Checkout />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/order-confirmation/:orderId"
                                    element={
                                        <ProtectedRoute>
                                            <OrderConfirmation />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Admin Routes */}
                                <Route
                                    path="/admin/*"
                                    element={
                                        <ProtectedRoute adminOnly>
                                            <Admin />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Catch all route */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Layout>

                        {/* Toast Notifications */}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: '#FFF8DC',
                                    color: '#FF4500',
                                    border: '2px solid #FFD700',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                },
                                success: {
                                    iconTheme: {
                                        primary: '#FFD700',
                                        secondary: '#FFF8DC'
                                    }
                                },
                                error: {
                                    iconTheme: {
                                        primary: '#DC143C',
                                        secondary: '#FFF8DC'
                                    }
                                }
                            }}
                        />
                    </Router>
                </CartProvider>
            </ProductProvider>
        </AuthProvider>
    );
}

export default App;