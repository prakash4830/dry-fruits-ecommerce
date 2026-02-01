/**
 * Main App Component
 * 
 * Worker: Dev - App routing and layout
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navbar, Footer } from './components/layout';
import {
  HomePage,
  ProductsPage,
  ProductDetailPage,
  CartPage,
  CheckoutPage,
  LoginPage,
  RegisterPage,
  OrderHistoryPage,
  OrderDetailPage,
  UserProfilePage,
  AdminDashboardPage,
  AboutPage
} from './pages';

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 pt-16">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-32 text-center">
      <h1 className="text-8xl font-black text-amber-500 mb-4">404</h1>
      <h2 className="text-3xl font-bold mb-6">Oops! Page not found</h2>
      <p className="text-slate-500 mb-10 max-w-md mx-auto">The page you're looking for doesn't exist or has been moved to a new location.</p>
      <Link to="/" className="btn btn-primary rounded-full px-8">Back to Home</Link>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
