/**
 * Products Page
 * 
 * Worker: Dev - Product catalog with filters
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, X, ChevronDown } from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ProductGrid } from '../components/products/ProductGrid';
import { GlassCard } from '../components/ui/GlassCard';
import { fetchProducts, fetchCategories, setFilters } from '../store/slices/productsSlice';

export function ProductsPage() {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const [showFilters, setShowFilters] = useState(false);

    const { products, isLoading, filters } = useSelector((state) => state.products);

    // Hardcoded categories as requested for consistency
    const categories = [
        'Essential Nuts',
        'Dried Fruits & Figs',
        'Exotic Nuts & Specialty Items',
        'Berries & Dehydrated Fruits',
        'Seeds & Health Mixes',
        'Value-Added Products'
    ];

    // Get filters from URL
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search') || '';

    useEffect(() => {
        // Fetch products with filters
        // Convert friendly URL slug back to matching category slug if needed, 
        // but backend expects exact slug match.
        // Our navigation sends "essential", backend has "essential-nuts" maybe?
        // Actually, populate_products creates slugs like "essential-nuts".
        // Navbar sends `cat.split(' ')[0].toLowerCase()`.
        // e.g. "essential" -> "essential-nuts" ?? No.
        // Let's fix Navbar link logic to be safer or fix here.
        // Navbar sends: "Essential Nuts" -> "essential".
        // Backend slug: "essential-nuts".
        // We should make the Navbar send the full slug or process it here.
        // BETTER: Update Navbar to send simpler slug or match backend.
        // Let's assume for now we search by name contains or fix Navbar logic.
        // WAIT: Previous step Navbar set link to `cat.split(' ')[0]`.
        // Let's change this file to accept that partial slug or handle it.
        // Actually best is to just pass the filter to backend and let backend handle partial match or 
        // fix the Navbar to use full slug.

        // I will use a mapping for now to ensure robustness given the hardcoded Navbar links.

        let targetCategory = categorySlug;
        if (categorySlug) {
            // Mapping partial slugs to backend slugs
            const slugMap = {
                'essential': 'essential-nuts',
                'dried': 'dried-fruits-figs',
                'exotic': 'exotic-nuts-specialty-items',
                'berries': 'berries-dehydrated-fruits',
                'seeds': 'seeds-health-mixes',
                'value': 'value-added-products'
            };
            targetCategory = slugMap[categorySlug] || categorySlug;
        }

        const params = {
            ...(targetCategory && { category__slug: targetCategory }),
            ...(search && { search }),
            ...(filters.priceMin && { price__gte: filters.priceMin }),
            ...(filters.priceMax && { price__lte: filters.priceMax }),
            ordering: filters.ordering,
        };

        dispatch(fetchProducts(params));
    }, [dispatch, categorySlug, search, filters]);

    const handleFilterChange = (key, value) => {
        dispatch(setFilters({ [key]: value }));
    };

    const clearFilters = () => {
        setSearchParams({});
        dispatch(setFilters({
            priceMin: null,
            priceMax: null,
            ordering: '-created_at',
        }));
    };

    const sortOptions = [
        { value: '-created_at', label: 'Newest' },
        { value: 'price', label: 'Price: Low to High' },
        { value: '-price', label: 'Price: High to Low' },
        { value: 'name', label: 'Name: A-Z' },
    ];

    return (
        <div className="container py-8 min-h-screen">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2 text-slate-900">
                    {categorySlug ? categories.find(c => c.toLowerCase().startsWith(categorySlug)) || 'Products' : 'All Products'}
                </h1>
                <p className="text-slate-500">
                    {products.length} products found
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters - Desktop */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <GlassCard className="p-6 sticky top-24 bg-white/40 border-white/20">
                        <h3 className="font-semibold mb-4 text-slate-800">Filters</h3>

                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Categories</h4>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSearchParams({})}
                                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${!categorySlug ? 'bg-amber-100/50 text-amber-700 font-medium' : 'text-slate-600 hover:text-amber-600 hover:bg-white/40'
                                        }`}
                                >
                                    All Products
                                </button>
                                {categories.map((category) => {
                                    const simpleSlug = category.split(' ')[0].toLowerCase();
                                    const isActive = categorySlug === simpleSlug;
                                    return (
                                        <button
                                            key={category}
                                            onClick={() => setSearchParams({ category: simpleSlug })}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${isActive
                                                ? 'bg-amber-100/80 text-amber-700 font-bold shadow-sm'
                                                : 'text-slate-600 hover:text-amber-600 hover:bg-white/40'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wider">Price Range</h4>
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceMin || ''}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                    className="h-9 text-sm bg-white/50 border-slate-200 text-slate-700 placeholder:text-slate-400"
                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceMax || ''}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                    className="h-9 text-sm bg-white/50 border-slate-200 text-slate-700 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <Button
                            variant="ghost"
                            className="w-full text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>
                    </GlassCard>
                </aside>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        {/* Mobile Filter Toggle */}
                        <Button
                            variant="secondary"
                            className="lg:hidden bg-white text-slate-700 border border-slate-200 shadow-sm"
                            onClick={() => setShowFilters(true)}
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filters
                        </Button>

                        {/* Sort */}
                        <div className="flex items-center gap-2 ml-auto">
                            <span className="text-sm text-slate-500">Sort by:</span>
                            <select
                                value={filters.ordering}
                                onChange={(e) => handleFilterChange('ordering', e.target.value)}
                                className="input-glass py-2 px-3 pr-8 text-sm bg-white/50 border-slate-200 text-slate-700 focus:ring-amber-500 rounded-lg cursor-pointer"
                            >
                                {sortOptions.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                        className="text-slate-700"
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(categorySlug || search || filters.priceMin || filters.priceMax) && (
                        <div className="flex flex-wrap gap-2 mb-6">
                            {categorySlug && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                                    {categories.find(c => c.toLowerCase().startsWith(categorySlug)) || categorySlug}
                                    <button onClick={() => setSearchParams({})} className="ml-1 hover:text-amber-900">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Products Grid */}
                    <div className="min-h-[400px]">
                        <ProductGrid products={products} isLoading={isLoading} columns={3} />
                    </div>
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 lg:hidden bg-slate-900/40 backdrop-blur-sm"
                    onClick={() => setShowFilters(false)}
                >
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        className="absolute left-0 top-0 bottom-0 w-80 bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                            <IconButton onClick={() => setShowFilters(false)} variant="ghost" className="text-slate-500">
                                <X className="w-5 h-5" />
                            </IconButton>
                        </div>

                        {/* Mobile Filter Content */}
                        <div className="space-y-6">
                            {/* Categories */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Categories</h4>
                                <div className="space-y-1">
                                    {categories.map((category) => {
                                        const simpleSlug = category.split(' ')[0].toLowerCase();
                                        return (
                                            <button
                                                key={category}
                                                onClick={() => {
                                                    setSearchParams({ category: simpleSlug });
                                                    setShowFilters(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${categorySlug === simpleSlug ? 'bg-amber-100 text-amber-700 font-medium' : 'text-slate-600'}`}
                                            >
                                                {category}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}

export default ProductsPage;
