/**
 * Home Page
 * 
 * Worker: Dev - Landing page with Carousel
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, ShieldCheck, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { fetchProducts, fetchCategories, fetchFeaturedProducts, fetchBestsellers } from '../store/slices/productsSlice';
import { ProductCard, ProductCardSkeleton } from '../components/products/ProductCard';

export function HomePage() {
    const dispatch = useDispatch();
    const { featured: featuredProducts, bestsellers, isLoading } = useSelector((state) => state.products);

    useEffect(() => {
        dispatch(fetchFeaturedProducts());
        dispatch(fetchBestsellers());
        dispatch(fetchCategories());
    }, [dispatch]);

    const categoryImages = {
        'Essential Nuts': '/images/cat_essential_nuts_premium.png',
        'Dried Fruits & Figs': '/images/hero_dried_fruits_premium.png',
        'Exotic Nuts': '/images/cat_exotic_nuts_premium.png',
        'Berries & Dehydrated Fruits': '/images/hero_berries_premium.png',
        'Seeds & Health Mixes': '/images/cat_seeds_premium.png',
        'Value-Added Products': '/images/hero_nuts_premium.png',
    };

    const categories = [
        'Essential Nuts',
        'Dried Fruits & Figs',
        'Exotic Nuts',
        'Berries & Dehydrated Fruits',
        'Seeds & Health Mixes',
        'Value-Added Products'
    ];

    // Carousel Data
    const slides = [
        {
            id: 1,
            image: '/images/hero_nuts_premium.png',
            title: "Nature's Golden Treasure",
            subtitle: "Premium almonds, organic cashews, and pistachios sourced from the finest farms.",
            color: "text-amber-500"
        },
        {
            id: 2,
            image: '/images/hero_dried_fruits_premium.png',
            title: "Sweetness of Nature",
            subtitle: "Succulent dates, figs, and apricots. No added sugar, just pure goodness.",
            color: "text-orange-500"
        },
        {
            id: 3,
            image: '/images/cat_exotic_nuts_1769856712080.png',
            title: "Exotic & Rare",
            subtitle: "Discover the crunch of Macadamia, Hazelnuts, and Pine Nuts.",
            color: "text-yellow-500"
        },
        {
            id: 4,
            image: '/images/hero_berries_premium.png',
            title: "Berry Burst",
            subtitle: "Antioxidant-rich dried cranberries, blueberries, and superfruits.",
            color: "text-red-500"
        },
        {
            id: 5,
            image: '/images/cat_seeds_1769856747147.png',
            title: "Power Seeds",
            subtitle: "Pumpkin, Chia, and Flax seeds for your daily vitality boost.",
            color: "text-green-500"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="min-h-screen">
            {/* Hero Carousel Section */}
            <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.7 }}
                        className="absolute inset-0"
                    >
                        {/* Image Background */}
                        <div className="absolute inset-0">
                            <img
                                src={slides[currentSlide].image}
                                alt={slides[currentSlide].title}
                                className="w-full h-full object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="container relative z-10 h-full flex items-center px-4">
                            <div className="max-w-2xl">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-tight"
                                >
                                    <span className={slides[currentSlide].color}>{slides[currentSlide].title.split(" ")[0]} </span>
                                    {slides[currentSlide].title.split(" ").slice(1).join(" ")}
                                </motion.h1>
                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-xl md:text-2xl text-slate-200 mb-10 font-light leading-relaxed"
                                >
                                    {slides[currentSlide].subtitle}
                                </motion.p>
                                <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Link to="/products">
                                        <Button size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl shadow-amber-500/20 hover:scale-105 transition-transform bg-amber-500 hover:bg-amber-600 text-white border-0">
                                            Shop Collection
                                        </Button>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Carousel Controls */}
                <div className="absolute bottom-10 right-10 z-20 flex gap-4">
                    <button onClick={prevSlide} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={nextSlide} className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20">
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>

                {/* Indicators */}
                <div className="absolute bottom-10 left-10 md:left-1/2 md:-translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'w-8 bg-amber-500' : 'w-2 bg-white/30 hover:bg-white/50'
                                }`}
                        />
                    ))}
                </div>
            </section>

            {/* Features Banner */}
            <section className="container -mt-16 relative z-20 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: ShieldCheck, title: "Premium Quality", desc: "Handpicked from best farms" },
                        { icon: Truck, title: "Express Delivery", desc: "Across all major cities" },
                        { icon: Star, title: "Best Prices", desc: "Wholesale rates for everyone" }
                    ].map((feature, i) => (
                        <GlassCard key={i} className="p-8 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-amber-100 shadow-xl">
                            <div className="p-4 rounded-full bg-amber-50 text-amber-600">
                                <feature.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{feature.title}</h3>
                                <p className="text-slate-500">{feature.desc}</p>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container py-12">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800 mb-2">Our Collections</h2>
                        <p className="text-slate-500">Explore our wide range of healthy bites</p>
                    </div>
                    <Link to="/products">
                        <Button variant="ghost" className="text-amber-600">View All <ArrowRight className="w-4 h-4 ml-2" /></Button>
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {categories.map((name, i) => (
                        <Link to={`/products?category=${name.split(' ')[0].toLowerCase()}`} key={name}>
                            <motion.div
                                whileHover={{ y: -10 }}
                                className="group relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                            >
                                <img
                                    src={categoryImages[name] || categoryImages['Value-Added Products']}
                                    alt={name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                <div className="absolute bottom-0 left-0 p-6">
                                    <h3 className="text-white text-xl md:text-2xl font-bold">{name}</h3>
                                    <span className="text-amber-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                        Explore Collection →
                                    </span>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products Preview */}
            <section className="container py-20 bg-amber-50/50 rounded-3xl my-12">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">Best Sellers</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Our most loved products, chosen by thousands of happy customers.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)
                    ) : bestsellers.length > 0 ? (
                        bestsellers.slice(0, 4).map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p className="col-span-4 text-center text-slate-500">No best sellers found.</p>
                    )}
                </div>
            </section>
        </div>
    );
}

export default HomePage;
