/**
 * Navigation Component
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Main navigation header
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShoppingCart,
    User,
    Search,
    Menu,
    X,
    Heart,
    Package
} from 'lucide-react';
import { IconButton } from '../ui/Button';
import { Logo } from '../ui/Logo';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, loadGuestCartFromStorage } from '../../store/slices/cartSlice';
import { fetchProfile } from '../../store/slices/authSlice';

export function Navbar() {
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const location = useLocation();

    // Auth state and cart count
    const auth = useSelector((state) => state.auth);
    const isAuthenticated = auth?.isAuthenticated;
    const cart = useSelector((state) => state.cart);
    const cartItemCount = cart?.items?.length || 0;

    // Initial load
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
            // Ensure user profile is loaded if we have a token
            if (!auth.user) {
                dispatch(fetchProfile());
            }
        } else {
            dispatch(loadGuestCartFromStorage());
        }
    }, [dispatch, isAuthenticated, auth.user]);

    const categories = [
        { name: 'Essential Nuts', slug: 'essential-nuts' },
        { name: 'Dried Fruits & Figs', slug: 'dried-fruits-figs' },
        { name: 'Exotic Nuts & Specialty Items', slug: 'exotic-nuts-specialty-items' },
        { name: 'Berries & Dehydrated Fruits', slug: 'berries-dehydrated-fruits' },
        { name: 'Seeds & Health Mixes', slug: 'seeds-health-mixes' },
        { name: 'Value-Added Products', slug: 'value-added-products' }
    ];

    return (
        <>
            <nav className="glass-nav fixed top-0 left-0 right-0 z-[100] h-16 transition-all duration-300">
                <div className="container mx-auto h-full flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center">
                        <Logo variant="navbar" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>

                        <div className="relative group">
                            <Link to="/products" className={`nav-link ${location.pathname.includes('/products') ? 'active' : ''}`}>
                                Products
                            </Link>
                            {/* Dropdown for Categories */}
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl p-2 rounded-xl border border-slate-200 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 z-50">
                                {categories.map(cat => (
                                    <Link
                                        key={cat.slug}
                                        to={`/products?category=${cat.slug}`}
                                        className="block px-4 py-2 rounded-lg hover:bg-amber-50 text-sm text-slate-800 hover:text-amber-600 font-medium transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Search Button */}
                        <IconButton
                            variant="ghost"
                            onClick={() => setIsSearchOpen(true)}
                            aria-label="Search"
                            className="text-slate-800 hover:text-amber-600"
                        >
                            <Search className="w-5 h-5" />
                        </IconButton>

                        {/* Wishlist - Desktop */}
                        <Link to="/wishlist" className="hidden md:block">
                            <IconButton variant="ghost" aria-label="Wishlist" className="text-slate-800 hover:text-amber-600">
                                <Heart className="w-5 h-5" />
                            </IconButton>
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative" id="nav-cart-icon">
                            <IconButton variant="ghost" aria-label="Cart" className="text-slate-800 hover:text-amber-600">
                                <ShoppingCart className="w-5 h-5" />
                                {cartItemCount > 0 && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-xs font-bold flex items-center justify-center text-white"
                                    >
                                        {cartItemCount}
                                    </motion.span>
                                )}
                            </IconButton>
                        </Link>

                        {/* User Menu */}
                        <Link to="/profile" className="hidden md:block">
                            <IconButton variant="ghost" aria-label="Account" className="text-slate-800 hover:text-amber-600">
                                <User className="w-5 h-5" />
                            </IconButton>
                        </Link>

                        {/* Mobile Menu Toggle */}
                        <IconButton
                            variant="ghost"
                            className="md:hidden text-slate-800 hover:text-amber-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Menu"
                        >
                            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </IconButton>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed inset-x-0 top-16 z-50 md:hidden"
                    >
                        <div className="glass-card m-4 p-6 border-white/20 shadow-2xl bg-white/90 backdrop-blur-2xl">
                            <div className="flex flex-col gap-2">
                                <Link to="/" className="block p-3 text-slate-900 hover:bg-amber-50 hover:text-amber-600 font-bold text-base rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>Home</Link>

                                <div className="p-2">
                                    <span className="text-amber-600 font-black text-sm uppercase tracking-wider mb-3 block">Categories</span>
                                    <div className="pl-3 border-l-2 border-amber-500/30 space-y-2">
                                        <Link to="/products" className="block text-slate-900 font-bold hover:text-amber-600 py-1" onClick={() => setIsMenuOpen(false)}>All Products</Link>
                                        {categories.map(cat => (
                                            <Link
                                                key={cat.slug}
                                                to={`/products?category=${cat.slug}`}
                                                className="block text-sm text-slate-800 hover:text-amber-600 font-semibold py-1"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                {cat.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <Link to="/about" className="block p-3 text-slate-900 hover:bg-amber-50 hover:text-amber-600 font-bold text-base rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>About</Link>

                                <hr className="border-slate-300 my-3" />

                                <Link to="/profile" className="flex items-center gap-3 p-3 text-slate-900 hover:bg-amber-50 hover:text-amber-600 font-bold text-base rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                                    <User className="w-5 h-5" /> Account
                                </Link>
                                <Link to="/orders" className="flex items-center gap-3 p-3 text-slate-900 hover:bg-amber-50 hover:text-amber-600 font-bold text-base rounded-lg transition-all" onClick={() => setIsMenuOpen(false)}>
                                    <Package className="w-5 h-5" /> Orders
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Search Modal */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <motion.div
                            initial={{ y: -50, scale: 0.95, opacity: 0 }}
                            animate={{ y: 0, scale: 1, opacity: 1 }}
                            exit={{ y: -50, scale: 0.95, opacity: 0 }}
                            className="glass-card max-w-2xl mx-auto mt-20 p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-4">
                                <Search className="w-5 h-5 text-white/50" />
                                <input
                                    type="text"
                                    placeholder="Search for almonds, cashews, dried fruits..."
                                    className="flex-1 bg-transparent border-none outline-none text-slate-800 text-lg placeholder:text-slate-400"
                                    autoFocus
                                />
                                <IconButton variant="ghost" onClick={() => setIsSearchOpen(false)}>
                                    <X className="w-5 h-5" />
                                </IconButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spacer for fixed nav */}
            <div className="h-16" />
        </>
    );
}
