/**
 * Product Detail Page
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Detailed product view with gallery and actions
 */

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
    ShoppingCart,
    Heart,
    Share2,
    Star,
    Minus,
    Plus,
    Check,
    Truck,
    Shield,
    ArrowLeft
} from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { Badge } from '../components/ui/Badge';
import { fetchProductBySlug, clearCurrentProduct } from '../store/slices/productsSlice';
import { addToCart, addToGuestCart } from '../store/slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { AuthModal } from '../components/auth/AuthModal';

export function ProductDetailPage() {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const { currentProduct: product, isLoading, error } = useSelector((state) => state.products);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAdding, setIsAdding] = useState(false);
    const [isBuying, setIsBuying] = useState(false);

    useEffect(() => {
        dispatch(fetchProductBySlug(slug));
        return () => dispatch(clearCurrentProduct());
    }, [dispatch, slug]);

    // ... (keep intermediate code if matched, but here I'm targeting the state init mostly or just adding it)
    // actually I need to insert the state at the top. I'll use a separate replace for state.

    // Let's target the render part for Quantity and Attributes.

    // 1. Attributes -> Weight Selector
    // 2. Quantity -> Smaller

    // I will do it in chunks.


    const handleQuantityChange = (val) => {
        if (val >= 1 && val <= (product?.stock || 1)) {
            setQuantity(val);
        }
    };

    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [isAuthModalOpen, setAuthModalOpen] = useState(false);

    const handleAddToCart = async () => {
        if (!product) return;

        setIsAdding(true);
        try {
            if (isAuthenticated) {
                await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
            } else {
                dispatch(addToGuestCart({ product, quantity }));
            }
            // Optional: Add a toast notification here if you have a toast system
            // For now, simpler verification
            console.log('Added to cart successfully');
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert(err.error || 'Failed to add item to cart');
        } finally {
            setIsAdding(false);
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;

        if (isAuthenticated) {
            setIsBuying(true);
            await dispatch(addToCart({ productId: product.id, quantity }));
            setIsBuying(false);
            navigate('/checkout');
        } else {
            setAuthModalOpen(true);
        }
    };

    const handleAuthSuccess = async () => {
        // Authenticated via modal, now add to cart and checkout
        setIsBuying(true);
        await dispatch(addToCart({ productId: product.id, quantity }));
        setIsBuying(false);
        navigate('/checkout');
    };

    if (isLoading || !product) {
        return (
            <div className="container py-20">
                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="aspect-square skeleton rounded-2xl" />
                    <div className="space-y-6">
                        <div className="skeleton h-8 w-3/4" />
                        <div className="skeleton h-6 w-1/4" />
                        <div className="skeleton h-32 w-full" />
                        <div className="skeleton h-12 w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Product not found</h2>
                <Link to="/products">
                    <Button variant="secondary">Back to Products</Button>
                </Link>
            </div>
        );
    }

    const images = product.images?.length > 0
        ? product.images
        : [{ image: product.image || `https://picsum.photos/seed/${product.id}/600/600` }];

    const discount = product.compare_at_price
        ? Math.round((1 - product.price / product.compare_at_price) * 100)
        : 0;

    return (
        <div className="container py-8 lg:py-12">
            {/* Breadcrumb / Back */}
            <div className="mb-6">
                <Link to="/products" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Products
                </Link>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Image Gallery */}
                <div className="space-y-4">
                    <GlassCard className="relative aspect-square overflow-hidden rounded-3xl p-0 border-white/20 shadow-2xl">
                        <motion.img
                            key={selectedImage}
                            initial={{ opacity: 0, scale: 1.1 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            src={images[selectedImage].image || images[selectedImage]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />

                        {/* Floating Actions */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                            <IconButton variant="glass" className="backdrop-blur-md">
                                <Heart className="w-5 h-5" />
                            </IconButton>
                            <IconButton variant="glass" className="backdrop-blur-md">
                                <Share2 className="w-5 h-5" />
                            </IconButton>
                        </div>

                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.is_bestseller && <Badge variant="primary">Bestseller</Badge>}
                            {discount > 0 && <Badge variant="warning">-{discount}%</Badge>}
                        </div>
                    </GlassCard>

                    {/* Thumbnails */}
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-24 aspect-square rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${selectedImage === idx
                                        ? 'border-amber-400 ring-2 ring-amber-400/20'
                                        : 'border-transparent opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={img.image || img}
                                        alt={`${product.name} view ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
                            <span className="uppercase tracking-wider">{product.category?.name}</span>
                            {product.stock > 0 ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> In Stock
                                </span>
                            ) : (
                                <span className="text-red-500">Out of Stock</span>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < Math.floor(product.rating || 4.5)
                                            ? 'fill-amber-400 text-amber-400'
                                            : 'text-white/20'
                                            }`}
                                    />
                                ))}
                                <span className="text-white/60 text-sm ml-2">
                                    (120 reviews)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-end gap-3 mb-6">
                            <span className="text-4xl font-bold text-amber-600">
                                ₹{product.price}
                            </span>
                            {product.compare_at_price && (
                                <span className="text-xl text-slate-400 line-through mb-1">
                                    ₹{product.compare_at_price}
                                </span>
                            )}
                        </div>

                        <p className="text-slate-600 leading-relaxed text-lg">
                            {product.description}
                        </p>
                    </div>

                    <hr className="border-white/10" />

                    {/* Weight Selection */}
                    <div>
                        <span className="block text-slate-500 text-xs mb-2 uppercase tracking-widest font-bold">Select Weight</span>
                        <div className="flex flex-wrap gap-2">
                            {(() => {
                                const standardWeights = ['50g', '100g', '200g', '300g', '500g'];
                                const allVariants = [product, ...(product.variants || [])];

                                return standardWeights.map((weight) => {
                                    // Find variant matching this weight (case-insensitive, ignore spaces)
                                    const variant = allVariants.find(v =>
                                        v.weight.toLowerCase().replace(/\s/g, '') === weight.toLowerCase().replace(/\s/g, '')
                                    );

                                    const isCurrent = variant?.slug === product.slug;
                                    const isAvailable = !!variant;

                                    return (
                                        <button
                                            key={weight}
                                            onClick={() => {
                                                if (isAvailable && !isCurrent) {
                                                    navigate(`/products/${variant.slug}`);
                                                }
                                            }}
                                            disabled={!isAvailable}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all relative ${isCurrent
                                                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                                                : isAvailable
                                                    ? 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed decoration-slate-300'
                                                }`}
                                        >
                                            {weight}
                                            {!isAvailable && (
                                                <span className="sr-only"> (Unavailable)</span>
                                            )}
                                            {/* Diagonal line for unavailable items */}
                                            {!isAvailable && (
                                                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="w-full border-t border-slate-300 rotate-12 transform opacity-50"></span>
                                                </span>
                                            )}
                                        </button>
                                    );
                                });
                            })()}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4 pt-2">
                        <div className="flex gap-3">
                            {/* Quantity - Compact */}
                            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1.5 rounded-xl shadow-sm h-12">
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(quantity - 1)}
                                    disabled={quantity <= 1}
                                    className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                                >
                                    <Minus className="w-3 h-3" />
                                </IconButton>
                                <span className="text-sm font-bold w-6 text-center text-slate-900">{quantity}</span>
                                <IconButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(quantity + 1)}
                                    disabled={quantity >= product.stock}
                                    className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                                >
                                    <Plus className="w-3 h-3" />
                                </IconButton>
                            </div>

                            {/* Add to Cart */}
                            <Button
                                size="default"
                                className="flex-1 text-base h-12"
                                onClick={handleAddToCart}
                                isLoading={isAdding}
                                disabled={product.stock === 0}
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>

                            {/* Buy Now */}
                            <Button
                                size="default"
                                variant="secondary"
                                className="flex-1 text-base h-12 bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200"
                                onClick={handleBuyNow}
                                isLoading={isBuying}
                                disabled={product.stock === 0}
                            >
                                Buy Now
                            </Button>
                        </div>

                        {/* Features */}
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-2">
                            <div className="flex items-center gap-1.5">
                                <Truck className="w-4 h-4 text-amber-500" />
                                <span>Free delivery &gt;₹499</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield className="w-4 h-4 text-amber-500" />
                                <span>Secure payment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal for Buy Now */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setAuthModalOpen(false)}
                onSuccess={handleAuthSuccess}
            />
        </div>
    );
}

export default ProductDetailPage;
