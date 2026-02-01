/**
 * Admin Dashboard Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Analytics and key metrics
 * Worker: BA - Maps to FR-A01
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    ShoppingBag,
    Users,
    AlertTriangle,
    Download,
    Calendar
} from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
// Ideally imports from a new adminAPI service, but mocking for now
import { ordersAPI } from '../services/api';

export function AdminDashboardPage() {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        customers: 0,
        lowStock: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // In a real app, this would be a single dashboard API call
            // For now, we'll fetch orders to mock some stats
            const response = await ordersAPI.getAll();
            const orders = response.data;

            const revenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

            setStats({
                revenue,
                orders: orders.length,
                customers: new Set(orders.map(o => o.user)).size || 12, // Mock customer count if user ID not exposed effectively
                lowStock: 5 // Mock low stock count
            });

            setRecentOrders(orders.slice(0, 5));
        } catch (error) {
            console.error('Failed to load dashboard:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color }) => (
        <GlassCard className="p-8 relative overflow-hidden group border-white/20 shadow-xl bg-white/40">
            <div className={`
        absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 
        transition-transform group-hover:scale-125 duration-700
        ${color === 'green' ? 'bg-emerald-500' : ''}
        ${color === 'amber' ? 'bg-amber-500' : ''}
        ${color === 'blue' ? 'bg-sky-500' : ''}
        ${color === 'red' ? 'bg-rose-500' : ''}
      `} />

            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-white/50 shadow-inner`}>
                    <Icon className={`w-7 h-7 
                        ${color === 'green' ? 'text-emerald-500' : ''}
                        ${color === 'amber' ? 'text-amber-500' : ''}
                        ${color === 'blue' ? 'text-sky-500' : ''}
                        ${color === 'red' ? 'text-rose-500' : ''}
                    `} />
                </div>
                {trend && (
                    <Badge variant={trend > 0 ? 'success' : 'danger'} className="font-bold py-1 px-3 shadow-sm">
                        {trend > 0 ? '+' : ''}{trend}%
                    </Badge>
                )}
            </div>

            <h3 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">{title}</h3>
            <p className="text-3xl font-black text-slate-800 tracking-tighter">{value}</p>
        </GlassCard>
    );

    return (
        <div className="container py-8">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h1 className="text-4xl font-black mb-2 text-slate-800 tracking-tight">Executive Dashboard</h1>
                    <p className="text-slate-500 font-medium">Monitoring the pulse of Nectar & Nut</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="secondary" className="rounded-xl px-6">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last 30 Days
                    </Button>
                    <Button className="rounded-xl px-8 shadow-lg shadow-amber-500/20">
                        <Download className="w-4 h-4 mr-2" />
                        Export Insights
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    icon={TrendingUp}
                    trend={12.5}
                    color="green"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.orders}
                    icon={ShoppingBag}
                    trend={8.2}
                    color="amber"
                />
                <StatCard
                    title="Active Customers"
                    value={stats.customers}
                    icon={Users}
                    trend={2.1}
                    color="blue"
                />
                <StatCard
                    title="Low Stock Items"
                    value={stats.lowStock}
                    icon={AlertTriangle}
                    color="red"
                />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Recent Orders */}
                <div className="lg:col-span-2">
                    <GlassCard className="p-8 border-white/20 shadow-xl bg-white/40">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">Recent Transactions</h3>
                            <Button variant="ghost" size="sm" className="font-bold text-amber-600 hover:text-amber-700">Explore All</Button>
                        </div>

                        <div className="space-y-4">
                            {recentOrders.map((order) => (
                                <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl bg-white/50 border border-white/40 hover:bg-white/70 transition-all duration-300 group shadow-sm">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 font-black text-xs shadow-inner">
                                            {order.order_number.slice(-3)}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800">Order #{order.order_number}</p>
                                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">
                                                {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <span className="font-black text-slate-900 text-lg tracking-tighter">₹{order.total_amount}</span>
                                        <Badge variant={
                                            order.status === 'delivered' ? 'success' :
                                                order.status === 'cancelled' ? 'danger' : 'warning'
                                        } className="font-black py-1 px-4 min-w-[100px] text-center shadow-sm">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Quick Actions / Reports */}
                <div className="space-y-6">
                    <GlassCard className="p-8 border-white/20 shadow-xl bg-gradient-to-br from-amber-50/50 to-white/30 backdrop-blur-3xl">
                        <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight">Intelligence Hub</h3>
                        <div className="space-y-4">
                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-white/40 hover:bg-white/90 transition-all duration-300 group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-500 shadow-inner">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 text-sm">Revenue Matrix</p>
                                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-0.5">XLSX / Analytics</p>
                                    </div>
                                </div>
                            </button>

                            <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/60 border border-white/40 hover:bg-white/90 transition-all duration-300 group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-xl bg-amber-50 text-amber-500 shadow-inner">
                                        <Download className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 text-sm">Inventory Protocol</p>
                                        <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest mt-0.5">Stock Integrity</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardPage;
