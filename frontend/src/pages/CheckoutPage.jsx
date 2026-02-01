/**
 * Checkout Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Multi-step checkout process
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Check, CreditCard, MapPin, Truck, ChevronRight, Plus, AlertCircle, Tag } from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Input, TextArea } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { addressesAPI, ordersAPI } from '../services/api';
import { clearCart } from '../store/slices/cartSlice';

const steps = [
    { id: 1, label: 'Shipping Address', icon: MapPin },
    { id: 2, label: 'Payment', icon: CreditCard },
    { id: 3, label: 'Confirmation', icon: Check },
];

export function CheckoutPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, subtotal, tax, shipping, total } = useSelector((state) => state.cart);
    const { isAuthenticated, user } = useSelector((state) => state.auth);

    const [currentStep, setCurrentStep] = useState(1);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Billing Address State
    const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
    const [selectedBillingAddressId, setSelectedBillingAddressId] = useState(null);
    const [showBillingAddressForm, setShowBillingAddressForm] = useState(false);

    // Coupon State
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    // Fetch addresses
    useEffect(() => {
        if (isAuthenticated) {
            loadAddresses();
        } else {
            // Redirect to login if not authenticated
            navigate('/login?redirect=/checkout');
        }
    }, [isAuthenticated, navigate]);

    const loadAddresses = async () => {
        try {
            const response = await addressesAPI.getAll();
            setAddresses(response.data);
            if (response.data.length > 0) {
                const defaultId = response.data[0].id;
                setSelectedAddressId(defaultId);
                setSelectedBillingAddressId(defaultId);
            } else {
                setShowAddressForm(true);
            }
        } catch (error) {
            console.error('Failed to load addresses:', error);
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        // Add defaults for missing fields if needed
        data.country = 'India';
        data.type = 'home';

        try {
            setIsLoading(true);
            const response = await addressesAPI.create(data);
            setAddresses([...addresses, response.data]);

            if (showAddressForm) {
                setSelectedAddressId(response.data.id);
                if (billingSameAsShipping) {
                    setSelectedBillingAddressId(response.data.id);
                }
                setShowAddressForm(false);
            } else if (showBillingAddressForm) {
                setSelectedBillingAddressId(response.data.id);
                setShowBillingAddressForm(false);
            }
        } catch (error) {
            console.error('Failed to create address:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode) return;
        setCouponError('');
        setCouponSuccess('');

        try {
            setIsLoading(true);
            const response = await ordersAPI.validateCoupon(couponCode, subtotal);
            setCouponDiscount(response.data.discount_amount);
            setCouponSuccess(`Coupon applied! You saved ₹${response.data.discount_amount}`);
        } catch (error) {
            setCouponDiscount(0);
            setCouponError(error.response?.data?.error || 'Invalid coupon code');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return;
        if (!billingSameAsShipping && !selectedBillingAddressId) {
            alert('Please select a billing address');
            return;
        }

        try {
            setIsLoading(true);

            // 1. Create Order
            const orderResponse = await ordersAPI.create(
                selectedAddressId,
                billingSameAsShipping ? null : selectedBillingAddressId,
                couponSuccess ? couponCode : null // Only send if valid
            );
            const orderId = orderResponse.data.id;

            // 2. Create Payment
            const paymentResponse = await ordersAPI.createPayment(orderId);
            const { razorpay_order_id, amount, currency, key_id } = paymentResponse.data;

            // 3. Open Razorpay
            const options = {
                key: key_id,
                amount: amount,
                currency: currency,
                name: 'Nutty Bites',
                description: `Order #${orderResponse.data.order_number}`,
                order_id: razorpay_order_id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        await ordersAPI.verifyPayment({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        // Success
                        dispatch(clearCart());
                        navigate(`/orders/${orderId}?success=true`);
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
                    email: user?.email,
                },
                theme: {
                    color: '#F59E0B',
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (error) {
            console.error('Order creation failed:', error);
            alert('Failed to place order. Please try again.'); // Minimal error handling
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container py-12">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            {/* Steps */}
            <div className="flex justify-between max-w-2xl mx-auto mb-12 relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                {steps.map((step) => {
                    const isActive = step.id === currentStep;
                    const isCompleted = step.id < currentStep;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isActive || isCompleted
                                        ? 'bg-amber-500 border-amber-500 text-white'
                                        : 'bg-slate-100 border-slate-200 text-slate-400'}
                `}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                            </div>
                            <span className={`text-sm ${isActive ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Process */}
                <div className="lg:col-span-2">
                    {/* Step 1: Address */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            {!showAddressForm && (
                                <div className="grid gap-4">
                                    {addresses.map((addr) => (
                                        <GlassCard
                                            key={addr.id}
                                            className={`
                        p-6 cursor-pointer border-2 transition-all
                        ${selectedAddressId === addr.id
                                                    ? 'border-amber-400 bg-amber-50'
                                                    : 'border-transparent bg-white/50 hover:bg-white/80'}
                      `}
                                            onClick={() => setSelectedAddressId(addr.id)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold text-slate-800">{addr.name || 'My Address'}</span>
                                                        <Badge variant="secondary">{addr.type}</Badge>
                                                    </div>
                                                    <p className="text-slate-600 text-sm leading-relaxed">
                                                        {addr.address_line1}, {addr.address_line2 && `${addr.address_line2}, `}
                                                        <br />
                                                        {addr.city}, {addr.state} - {addr.pincode}
                                                    </p>
                                                    <p className="text-slate-500 text-sm mt-2">
                                                        Phone: {addr.phone_number}
                                                    </p>
                                                </div>
                                                {selectedAddressId === addr.id && (
                                                    <div className="bg-amber-500 rounded-full p-1 text-white">
                                                        <Check className="w-4 h-4" />
                                                    </div>
                                                )}
                                            </div>
                                        </GlassCard>
                                    ))}

                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="flex items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-slate-500 hover:text-amber-600"
                                    >
                                        <Plus className="w-5 h-5" />
                                        Add New Address
                                    </button>
                                </div>
                            )}

                            {showAddressForm && (
                                <GlassCard className="p-8 border-white/20 shadow-xl bg-white/40">
                                    <h3 className="text-xl font-bold mb-6 text-slate-800">Add New Address</h3>
                                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <Input name="name" label="Full Name" required className="bg-white/50" />
                                            <Input name="phone_number" label="Phone Number" required className="bg-white/50" />
                                        </div>
                                        <Input name="address_line1" label="Address Line 1" required className="bg-white/50" />
                                        <Input name="address_line2" label="Address Line 2 (Optional)" className="bg-white/50" />
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            <Input name="city" label="City" required className="bg-white/50" />
                                            <Input name="state" label="State" required className="bg-white/50" />
                                            <Input name="pincode" label="Pincode" required className="bg-white/50" />
                                        </div>
                                        <div className="flex gap-4 pt-6">
                                            <Button type="submit" isLoading={isLoading} className="rounded-xl px-8">Save & Use Address</Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                onClick={() => setShowAddressForm(false)}
                                                className="rounded-xl"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </form>
                                </GlassCard>
                            )}

                            {!showAddressForm && (
                                <div className="mt-8 pt-6 border-t border-slate-200/50">
                                    <label className="flex items-center gap-3 cursor-pointer group select-none">
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${billingSameAsShipping ? 'bg-amber-500 border-amber-500' : 'border-slate-300 bg-white group-hover:border-amber-400'}`}>
                                            {billingSameAsShipping && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={billingSameAsShipping}
                                            onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                                        />
                                        <span className="text-slate-800 font-medium">Billing address same as shipping address</span>
                                    </label>

                                    {!billingSameAsShipping && (
                                        <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 fade-in duration-300">
                                            <h3 className="text-lg font-bold text-slate-800 mb-4">Select Billing Address</h3>

                                            {!showBillingAddressForm ? (
                                                <div className="grid gap-4">
                                                    {addresses.map((addr) => (
                                                        <GlassCard
                                                            key={`billing-${addr.id}`}
                                                            className={`
                                                                p-5 cursor-pointer border-2 transition-all
                                                                ${selectedBillingAddressId === addr.id
                                                                    ? 'border-amber-400 bg-amber-50'
                                                                    : 'border-transparent bg-white/50 hover:bg-white/80'}
                                                            `}
                                                            onClick={() => setSelectedBillingAddressId(addr.id)}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-4 h-4 rounded-full border-2 ${selectedBillingAddressId === addr.id ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`} />
                                                                    <div>
                                                                        <span className="font-semibold text-slate-800 block text-sm">{addr.name}</span>
                                                                        <span className="text-slate-500 text-xs block">{addr.address_line1}, {addr.city}</span>
                                                                    </div>
                                                                </div>
                                                                <Badge variant="secondary" className="text-xs">{addr.type}</Badge>
                                                            </div>
                                                        </GlassCard>
                                                    ))}
                                                    <button
                                                        onClick={() => setShowBillingAddressForm(true)}
                                                        className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-400 hover:bg-amber-50 transition-all text-slate-500 hover:text-amber-600 text-sm font-medium"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        Add New Address
                                                    </button>
                                                </div>
                                            ) : (
                                                <GlassCard className="p-6 border-white/20 shadow-lg bg-white/40">
                                                    <h3 className="text-base font-bold mb-4 text-slate-800">New Billing Address</h3>
                                                    <form onSubmit={handleAddressSubmit} className="space-y-4">
                                                        <div className="grid md:grid-cols-2 gap-3">
                                                            <Input name="name" label="Full Name" required className="bg-white/50" />
                                                            <Input name="phone_number" label="Phone" required className="bg-white/50" />
                                                        </div>
                                                        <Input name="address_line1" label="Address Line 1" required className="bg-white/50" />
                                                        <Input name="address_line2" label="Address Line 2 (Optional)" className="bg-white/50" />
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                                            <Input name="city" label="City" required className="bg-white/50" />
                                                            <Input name="state" label="State" required className="bg-white/50" />
                                                            <Input name="pincode" label="Pin" required className="bg-white/50" />
                                                        </div>
                                                        <div className="flex gap-3 pt-2">
                                                            <Button type="submit" isLoading={isLoading} size="sm">Save Address</Button>
                                                            <Button type="button" variant="ghost" size="sm" onClick={() => setShowBillingAddressForm(false)}>Cancel</Button>
                                                        </div>
                                                    </form>
                                                </GlassCard>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {addresses.length > 0 && !showAddressForm && !showBillingAddressForm && (
                                <div className="flex justify-end pt-4">
                                    <Button
                                        size="lg"
                                        onClick={() => setCurrentStep(2)}
                                        disabled={!selectedAddressId}
                                    >
                                        Continue to Payment
                                        <ChevronRight className="w-5 h-5 ml-1" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Payment */}
                    {currentStep === 2 && (
                        <GlassCard className="p-12 text-center bg-white/40 border-white/20 shadow-2xl">
                            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 text-amber-500 shadow-inner">
                                <CreditCard className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-800 tracking-tight">Secure Payment Confirmation</h3>
                            <p className="text-slate-500 mb-10 max-w-md mx-auto text-lg leading-relaxed">
                                You are about to pay <span className="text-amber-600 font-bold">₹{total}</span> via Razorpay. <br />
                                All transactions are encrypted and secure.
                            </p>

                            <div className="flex justify-center gap-6">
                                <Button variant="secondary" onClick={() => setCurrentStep(1)} className="rounded-xl px-8">
                                    Back to Address
                                </Button>
                                <Button size="lg" onClick={handlePlaceOrder} isLoading={isLoading} className="rounded-xl px-12 shadow-xl shadow-amber-500/20">
                                    Proceed to Pay
                                </Button>
                            </div>
                        </GlassCard>
                    )}
                </div>

                {/* Order Summary */}
                <div>
                    <GlassCard className="p-8 sticky top-24 bg-white/40 border-white/20 shadow-xl">
                        <h3 className="text-xl font-bold mb-6 text-slate-800 tracking-tight">Order Summary</h3>
                        <div className="space-y-4 mb-8 max-h-72 overflow-y-auto pr-3 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-14 h-14 rounded-xl bg-slate-50 flex-shrink-0 overflow-hidden border border-slate-100">
                                        <img src={item.product?.image || `https://picsum.photos/seed/${item.id}/100/100`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <p className="font-bold text-slate-800 truncate text-sm">{item.product?.name}</p>
                                        <p className="text-slate-400 text-xs">Qty: {item.quantity} × ₹{item.product?.price}</p>
                                    </div>
                                    <p className="font-bold text-slate-900 text-sm py-1">₹{item.total}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-200/50">
                            {/* Coupon Code */}
                            <div className="bg-white/50 p-4 rounded-xl border border-white/40">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Coupon Code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            disabled={!!couponSuccess}
                                            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white/80 border-none text-sm font-medium focus:ring-2 focus:ring-amber-400 outline-none uppercase placeholder:normal-case"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleApplyCoupon}
                                        isLoading={isLoading}
                                        disabled={!couponCode || !!couponSuccess}
                                        size="sm"
                                        className="rounded-lg"
                                    >
                                        Apply
                                    </Button>
                                </div>
                                {couponError && (
                                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1 font-medium">
                                        <AlertCircle className="w-3 h-3" /> {couponError}
                                    </p>
                                )}
                                {couponSuccess && (
                                    <p className="text-emerald-600 text-xs mt-2 flex items-center gap-1 font-medium">
                                        <Check className="w-3 h-3" /> {couponSuccess}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-between text-slate-500 font-medium text-sm">
                                <span>Subtotal</span>
                                <span>₹{subtotal}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium text-sm">
                                <span>Tax (18% GST)</span>
                                <span>₹{tax}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium text-sm">
                                <span>Shipping</span>
                                <span>{shipping > 0 ? `₹${shipping}` : <span className="text-emerald-500 font-bold">FREE</span>}</span>
                            </div>
                            {couponDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600 font-bold text-sm">
                                    <span>Discount Applied</span>
                                    <span>-₹{couponDiscount}</span>
                                </div>
                            )}
                            <div className="pt-2">
                                <hr className="border-slate-100" />
                            </div>
                            <div className="flex justify-between text-2xl font-black text-slate-900">
                                <span>Total</span>
                                <span className="text-amber-600">₹{total - couponDiscount}</span>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

export default CheckoutPage;
