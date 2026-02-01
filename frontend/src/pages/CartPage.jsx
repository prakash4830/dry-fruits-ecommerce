/**
 * Cart Page
 * 
 * Worker: Dev - Shopping cart with item management
 */

import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { fetchCart, updateCartItem, removeCartItem, updateGuestCartItem, removeGuestCartItem } from '../store/slices/cartSlice';

export function CartPage() {
    const dispatch = useDispatch();
    const { items, subtotal, tax, shipping, total, isLoading } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchCart());
        }
    }, [dispatch, isAuthenticated]);

    const handleUpdateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        if (isAuthenticated) {
            dispatch(updateCartItem({ itemId, quantity: newQuantity }));
        } else {
            dispatch(updateGuestCartItem({ itemId, quantity: newQuantity }));
        }
    };

    const handleRemoveItem = (itemId) => {
        if (isAuthenticated) {
            dispatch(removeCartItem(itemId));
        } else {
            dispatch(removeGuestCartItem(itemId));
        }
    };

    if (!items.length) {
        return (
            <div className="container py-24">
                <GlassCard className="p-16 text-center max-w-xl mx-auto shadow-2xl border-white/20">
                    <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag className="w-12 h-12 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4 text-slate-800 tracking-tight">Your cart is empty</h2>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                        Looks like you haven't discovered our premium dry fruits yet. <br />
                        Your health is just a few clicks away.
                    </p>
                    <Link to="/products">
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg">
                            Start Shopping
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    <AnimatePresence mode="popLayout">
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                            >
                                <GlassCard hoverable={false} className="p-6 border-white/20 shadow-lg group">
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0 bg-slate-50 relative">
                                            <img
                                                src={item.product?.image || `https://picsum.photos/seed/${item.id}/200/200`}
                                                alt={item.product?.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/products/${item.product?.slug}`}
                                                className="text-lg font-bold text-slate-800 hover:text-amber-600 transition-colors line-clamp-1 mb-1"
                                            >
                                                {item.product?.name}
                                            </Link>
                                            <p className="text-slate-500 text-sm mb-3 font-medium uppercase tracking-wider">
                                                {item.product?.weight || 'Pack'}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl font-bold text-amber-600">₹{item.product?.price}</span>
                                                {item.product?.compare_at_price && (
                                                    <span className="text-slate-400 text-sm line-through">₹{item.product?.compare_at_price}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-end justify-between">
                                            <div className="flex items-center gap-3 bg-slate-50/80 backdrop-blur-sm rounded-xl p-1.5 border border-slate-200/50">
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-8 rounded-lg hover:bg-white shadow-sm transition-all"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </IconButton>

                                                <span className="w-6 text-center font-bold text-slate-800">
                                                    {item.quantity}
                                                </span>

                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-lg hover:bg-white shadow-sm transition-all"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </IconButton>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-lg font-bold text-slate-900">
                                                    ₹{item.total}
                                                </p>
                                                <button
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors mt-1 underline-offset-4 hover:underline"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Order Summary */}
                <div>
                    <GlassCard className="p-8 sticky top-24 bg-white/40 border-white/20 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 tracking-tight">Order Summary</h3>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Subtotal ({items.length} items)</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Tax (18% GST)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium">
                                <span>Shipping Fees</span>
                                <span>{shipping > 0 ? `₹${shipping}` : <span className="text-emerald-500 font-bold">FREE</span>}</span>
                            </div>

                            <div className="py-2">
                                <hr className="border-slate-200/50" />
                            </div>

                            <div className="flex justify-between text-2xl font-black text-slate-900">
                                <span>Total</span>
                                <span className="text-amber-600">₹{total}</span>
                            </div>
                        </div>

                        {isAuthenticated ? (
                            <Link to="/checkout">
                                <Button className="w-full py-7 rounded-2xl text-lg shadow-xl shadow-amber-500/10" size="lg">
                                    Proceed to Checkout
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="space-y-4">
                                <Link to="/login?redirect=/checkout">
                                    <Button className="w-full py-7 rounded-2xl text-lg" size="lg">
                                        Login to Checkout
                                    </Button>
                                </Link>
                                <p className="text-center text-slate-400 text-sm">Or</p>
                                <Link to="/register?redirect=/checkout">
                                    <Button variant="secondary" className="w-full py-4 rounded-xl border-slate-200">
                                        Create New Account
                                    </Button>
                                </Link>
                            </div>
                        )}

                        <div className="mt-8 pt-6 border-t border-slate-200/50">
                            <div className="flex items-center justify-center gap-3 text-slate-400">
                                <span className="text-xs font-medium uppercase tracking-widest">Secure Payments</span>
                                <div className="h-4 w-px bg-slate-200" />
                                <span className="text-xs font-medium uppercase tracking-widest text-[#528FF0]">Razorpay</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

export default CartPage;
