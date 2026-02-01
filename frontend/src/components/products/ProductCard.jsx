/**
 * Product Card Component
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Product display card
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button, IconButton } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { AddToCartButton } from './AddToCartButton';

export function ProductCard({ product }) {
    const {
        id,
        name,
        slug,
        price,
        compare_at_price,
        primary_image,
        category_name,
        is_featured,
        is_bestseller,
        is_in_stock,
        rating = 4.5,
        stock,
    } = product;

    const discount = compare_at_price
        ? Math.round((1 - price / compare_at_price) * 100)
        : 0;

    const isOutOfStock = !is_in_stock;

    return (
        <GlassCard className="group liquid-hover bg-white/40 border-white/20 shadow-xl" hoverable={!isOutOfStock}>
            <Link to={`/products/${slug}`}>
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                    <motion.img
                        src={primary_image || `https://picsum.photos/seed/${id}/400/400`}
                        alt={name}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.4 }}
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {is_bestseller && (
                            <Badge variant="primary">Bestseller</Badge>
                        )}
                        {is_featured && !is_bestseller && (
                            <Badge variant="success">Featured</Badge>
                        )}
                        {discount > 0 && (
                            <Badge variant="warning">-{discount}%</Badge>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <IconButton
                            variant="ghost"
                            className="bg-white/10 backdrop-blur-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                // Add to wishlist
                            }}
                        >
                            <Heart className="w-4 h-4" />
                        </IconButton>
                    </div>

                    {/* Out of Stock Overlay */}
                    {isOutOfStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Category */}
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                        {category_name}
                    </p>

                    {/* Name */}
                    <h3 className="text-slate-800 font-semibold mb-2 line-clamp-2">
                        {name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < Math.floor(rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200'
                                    }`}
                            />
                        ))}
                        <span className="text-slate-500 text-xs ml-1">({rating})</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl font-bold text-amber-600">
                            ₹{price}
                        </span>
                        {compare_at_price && (
                            <span className="text-slate-400 text-sm line-through">
                                ₹{compare_at_price}
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            {/* Add to Cart Button */}
            <div className="px-4 pb-4">
                <AddToCartButton product={product} />
            </div>
        </GlassCard>
    );
}

export function ProductCardSkeleton() {
    return (
        <div className="glass-card">
            <div className="aspect-square skeleton rounded-t-2xl" />
            <div className="p-4 space-y-3">
                <div className="skeleton h-3 w-16" />
                <div className="skeleton h-5 w-full" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-6 w-20" />
            </div>
            <div className="px-4 pb-4">
                <div className="skeleton h-10 w-full rounded-xl" />
            </div>
        </div>
    );
}
