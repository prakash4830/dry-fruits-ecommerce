/**
 * Order Detail Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Single order tracking and details
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, MapPin, ArrowLeft, Clock, XCircle, Download } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ordersAPI } from '../services/api';

export function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            const response = await ordersAPI.getById(id);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to load order:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            // TODO: Implement invoice download API call
            const response = await ordersAPI.downloadInvoice(id);
            // Create blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${order.order_number}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download invoice:', error);
            alert('Invoice download is not yet available. This feature is coming soon!');
        }
    };

    if (isLoading) {
        return <div className="container py-12">Loading...</div>;
    }

    if (!order) {
        return <div className="container py-12">Order not found</div>;
    }

    const steps = [
        { status: 'pending', label: 'Order Placed', icon: Package },
        { status: 'processing', label: 'Processing', icon: Package },
        { status: 'shipped', label: 'Shipped', icon: Truck },
        { status: 'delivered', label: 'Delivered', icon: CheckCircle },
    ];

    const currentStepIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="container py-8">
            <div className="mb-6">
                <Link to="/orders" className="inline-flex items-center text-slate-500 hover:text-amber-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Link>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold mb-1 text-slate-900">
                        Order #{order.order_number}
                    </h1>
                    <p className="text-slate-500">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {order.delivered_at && (
                        <p className="text-emerald-600 font-semibold mt-1">
                            Delivered on {new Date(order.delivered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    )}
                </div>
                <Button variant="secondary" onClick={handleDownloadInvoice}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Invoice
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Tracking Timeline */}
                    <GlassCard className="p-8 bg-white/40 border-white/20 shadow-xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center -mr-8 -mt-8 opacity-20">
                                <Truck className="w-8 h-8 text-amber-500" />
                            </div>
                        </div>
                        <h3 className="text-lg font-black mb-10 text-slate-800 tracking-tight flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-500" />
                            Journey Status
                        </h3>
                        <div className="relative flex justify-between px-4">
                            <div className="absolute top-[20px] left-8 right-8 h-0.5 bg-slate-100 -z-10" />
                            {steps.map((step, index) => {
                                const isCompleted = index <= currentStepIndex || order.status === 'delivered';
                                const isActive = index === currentStepIndex;

                                return (
                                    <div key={step.status} className="flex flex-col items-center gap-3 relative z-10 transition-all duration-500">
                                        <div
                                            className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm
                        ${isCompleted || isActive
                                                    ? 'bg-amber-500 border-amber-500 text-white'
                                                    : 'bg-white border-slate-200 text-slate-300'}
                      `}
                                        >
                                            <step.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-amber-600' : 'text-slate-400'}`}>
                                            {step.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {order.status === 'cancelled' && (
                            <div className="mt-10 p-5 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-2xl text-red-600 text-center font-bold flex items-center justify-center gap-3">
                                <XCircle className="w-5 h-5" />
                                This order was cancelled and refunded.
                            </div>
                        )}
                    </GlassCard>

                    {/* Items */}
                    <GlassCard className="p-8 bg-white/40 border-white/20 shadow-xl mt-6">
                        <h3 className="text-lg font-black mb-8 text-slate-800 tracking-tight">Curated Selection ({order.items.length})</h3>
                        <div className="space-y-8">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-6 group">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0 overflow-hidden shadow-sm relative">
                                        <img src={item.product_image || `https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 py-1">
                                        <p className="font-black text-slate-800 mb-1">{item.product_name}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.product_weight}</p>
                                    </div>
                                    <div className="text-right py-1">
                                        <p className="font-black text-slate-900 text-lg">₹{item.price * item.quantity}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.quantity} × ₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Summary */}
                    <GlassCard className="p-8 bg-white/40 border-white/20 shadow-xl">
                        <h3 className="text-lg font-black mb-6 text-slate-800 tracking-tight">Order Investment</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between text-slate-500 font-bold text-sm tracking-tight">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold text-sm tracking-tight">
                                <span>Tax (18% GST)</span>
                                <span>₹{order.tax}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-bold text-sm tracking-tight">
                                <span>Privilege Shipping</span>
                                <span>{order.shipping_cost > 0 ? `₹${order.shipping_cost}` : <span className="text-emerald-500">FREE</span>}</span>
                            </div>
                            <div className="py-2">
                                <hr className="border-slate-200/50" />
                            </div>
                            <div className="flex justify-between text-2xl font-black text-slate-900 tracking-tighter">
                                <span>Total Paid</span>
                                <span className="text-amber-600">₹{order.total_amount}</span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* Shipping Address */}
                    <GlassCard className="p-8 bg-white/40 border-white/20 shadow-xl">
                        <h3 className="text-lg font-black mb-6 text-slate-800 tracking-tight">Delivery Details</h3>
                        <div className="flex gap-5">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                <MapPin className="w-6 h-6 text-amber-500" />
                            </div>
                            <div className="text-sm leading-relaxed">
                                <p className="font-black text-slate-900 mb-2 group-hover:text-amber-600 transition-colors uppercase tracking-widest text-xs">{order.shipping_name}</p>
                                <div className="text-slate-500 font-medium space-y-0.5">
                                    <p>{order.shipping_address_line1}</p>
                                    {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
                                    <p>{order.shipping_city}, {order.shipping_state}</p>
                                    <p className="font-black text-slate-800 mt-1">{order.shipping_pincode}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Contact Number</p>
                                    <p className="font-bold text-slate-700">{order.shipping_phone}</p>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

export default OrderDetailPage;
