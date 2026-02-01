/**
 * Order History Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - List user orders
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ordersAPI } from '../services/api';

export function OrderHistoryPage() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current'); // 'current' or 'previous'

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            setOrders(response.data);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'delivered': return 'success';
            case 'shipped': return 'primary';
            case 'cancelled': return 'cancelled';
            default: return 'glass';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
            default: return <Clock className="w-4 h-4 text-amber-400" />;
        }
    };

    // Categorize orders
    const currentOrders = orders.filter(order =>
        ['pending', 'confirmed', 'processing', 'shipped'].includes(order.status)
    );
    const previousOrders = orders.filter(order =>
        ['delivered', 'cancelled', 'refunded'].includes(order.status)
    );

    const displayOrders = activeTab === 'current' ? currentOrders : previousOrders;

    if (isLoading) {
        return (
            <div className="container py-12 space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-card h-48 skeleton rounded-3xl" />
                ))}
            </div>
        );
    }

    if (!orders.length) {
        return (
            <div className="container py-40 text-center">
                <GlassCard className="max-w-xl mx-auto p-16 border-white/20 shadow-2xl">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-3xl font-black mb-4 text-slate-800 tracking-tight">Your order history is empty</h2>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                        You haven't placed any orders yet. <br />
                        Our premium curated selection is waiting for you.
                    </p>
                    <Link to="/products">
                        <Button size="lg" className="rounded-full px-10 py-6 text-lg">
                            Start Your First Chapter
                        </Button>
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="container py-8">
            <h1 className="text-3xl font-bold mb-8 text-slate-900">My Orders</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('current')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'current'
                        ? 'text-amber-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Current Orders
                    {activeTab === 'current' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                    {currentOrders.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">
                            {currentOrders.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('previous')}
                    className={`px-6 py-3 font-semibold transition-all relative ${activeTab === 'previous'
                        ? 'text-amber-600'
                        : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Previous Orders
                    {activeTab === 'previous' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                    {previousOrders.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded-full">
                            {previousOrders.length}
                        </span>
                    )}
                </button>
            </div>

            {displayOrders.length === 0 && (
                <GlassCard className="max-w-xl mx-auto p-16 text-center border-white/20 shadow-2xl">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <Package className="w-12 h-12 text-slate-300" />
                    </div>
                    <h2 className="text-2xl font-black mb-4 text-slate-800 tracking-tight">
                        {activeTab === 'current' ? 'No current orders' : 'No previous orders'}
                    </h2>
                    <p className="text-slate-500 mb-10 text-lg leading-relaxed">
                        {activeTab === 'current'
                            ? 'You don\'t have any orders in progress.'
                            : 'You haven\'t completed any orders yet.'}
                    </p>
                    {activeTab === 'current' && (
                        <Link to="/products">
                            <Button size="lg" className="rounded-full px-10 py-6 text-lg">
                                Start Shopping
                            </Button>
                        </Link>
                    )}
                </GlassCard>
            )}

            <div className="space-y-4">
                {displayOrders.map((order, i) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Link to={`/orders/${order.id}`}>
                            <GlassCard className="p-8 group border-white/20 shadow-lg hover:shadow-2xl transition-all duration-500">
                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                    {/* Order Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="font-mono text-slate-400 font-bold bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                                                #{order.order_number}
                                            </span>
                                            <Badge variant={getStatusColor(order.status)} className="flex items-center gap-2 py-1 px-4 shadow-sm">
                                                {getStatusIcon(order.status)}
                                                <span className="capitalize font-bold text-xs tracking-widest">{order.status}</span>
                                            </Badge>
                                        </div>

                                        <p className="text-sm font-medium text-slate-400 mb-6">
                                            Ordered on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>

                                        {/* Item Preview */}
                                        <div className="flex flex-wrap gap-3">
                                            {order.items?.slice(0, 4).map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 relative group/item shadow-sm"
                                                    title={item.product_name}
                                                >
                                                    <img src={item.product_image || `https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover group-hover/item:scale-110 transition-transform" />
                                                    <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-tl-lg text-[10px] font-black text-slate-800 border-l border-t border-slate-200/50">
                                                        {item.quantity}×
                                                    </div>
                                                </div>
                                            ))}
                                            {order.items?.length > 4 && (
                                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-sm font-bold text-slate-400 border border-slate-100 shadow-sm">
                                                    +{order.items.length - 4}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Total & Action */}
                                    <div className="flex flex-row md:flex-col justify-between items-end text-right">
                                        <div className="space-y-1">
                                            <span className="block text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Investment</span>
                                            <span className="text-3xl font-black text-slate-900 tracking-tight">
                                                ₹{order.total_amount}
                                            </span>
                                        </div>

                                        <div className="bg-amber-50 group-hover:bg-amber-500 group-hover:text-white text-amber-600 px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center font-bold text-sm shadow-sm">
                                            Manage Order
                                            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1" />
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

export default OrderHistoryPage;
