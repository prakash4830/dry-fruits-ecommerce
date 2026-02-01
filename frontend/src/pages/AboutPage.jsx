/**
 * About Us Page
 * iOS 26 Liquid Glass design
 */

import { motion } from 'framer-motion';
import { ShieldCheck, Heart, Leaf, Star, Users, MapPin } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export function AboutPage() {
    const values = [
        {
            icon: ShieldCheck,
            title: "Premium Quality",
            description: "We source only the finest nuts and dry fruits from the world's best orchards, ensuring every bite meets our gold standard.",
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            icon: Leaf,
            title: "100% Natural",
            description: "Pure, wholesome goodness with no artificial additives or preservatives. Just nature's best, preserved as it should be.",
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        },
        {
            icon: Heart,
            title: "Health First",
            description: "Nutrient-dense snacks designed to power your lifestyle and support your well-being with every handful.",
            color: "text-rose-600",
            bg: "bg-rose-100"
        }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&q=80&w=1600"
                        alt="Harvest"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 to-white" />
                </div>

                <div className="container relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black mb-8 text-white tracking-tighter"
                    >
                        Our <span className="text-amber-500">Story</span>
                    </motion.h1>
                    <motion.p
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl md:text-3xl text-slate-100 max-w-4xl mx-auto font-medium leading-relaxed"
                    >
                        Crafting a legacy of health and premium nature's bounty <br className="hidden md:block" />
                        straight to your wellness ritual.
                    </motion.p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-20 -mt-20 relative z-20">
                <div className="container">
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                                The Nutty Bites <span className="text-amber-600">Philosophy</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                At Nutty Bites, we believe that snacking should be both indulgent and nourishing. Our journey started with a simple mission: to make premium, healthy dry fruits accessible to everyone without compromising on taste or quality.
                            </p>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                We travel across continents to find growers who share our passion for perfection. From the sun-soaked orchards of California to the mystical valleys of Kashmir, we handpick every batch to ensure you get nothing but the best.
                            </p>
                            <div className="flex gap-6">
                                <GlassCard hoverable={false} className="p-6 flex flex-col items-center bg-white/40 border-white/20 shadow-xl min-w-[100px]">
                                    <span className="text-3xl font-black text-amber-600 tracking-tighter">50+</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Products</span>
                                </GlassCard>
                                <GlassCard hoverable={false} className="p-6 flex flex-col items-center bg-white/40 border-white/20 shadow-xl min-w-[100px]">
                                    <span className="text-3xl font-black text-amber-600 tracking-tighter">10k+</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Healthies</span>
                                </GlassCard>
                                <GlassCard hoverable={false} className="p-6 flex flex-col items-center bg-white/40 border-white/20 shadow-xl min-w-[100px]">
                                    <span className="text-3xl font-black text-amber-600 tracking-tighter">24hr</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Support</span>
                                </GlassCard>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            whileInView={{ x: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                                <img
                                    src="https://images.unsplash.com/photo-1510629954389-c1e0da47d414?auto=format&fit=crop&q=80&w=800"
                                    alt="Nuts Assortment"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-8 -right-8">
                                <GlassCard hoverable={false} className="p-8 bg-white/60 border-white/40 shadow-2xl max-w-xs backdrop-blur-3xl">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                                            <Star className="w-6 h-6 fill-current" />
                                        </div>
                                        <span className="font-black text-slate-900 uppercase tracking-widest text-xs">Top Rated 2024</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed">
                                        Voted #1 for quality and freshness by the Health Snackers Association.
                                    </p>
                                </GlassCard>
                            </div>
                        </motion.div>
                    </div>

                    {/* Values Grid */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, index) => (
                            <motion.div
                                key={value.title}
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                            >
                                <GlassCard className="p-8 h-full">
                                    <div className={`w-12 h-12 ${value.bg} ${value.color} rounded-2xl flex items-center justify-center mb-6`}>
                                        <value.icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-4 text-slate-900">{value.title}</h3>
                                    <p className="text-slate-600 leading-relaxed">
                                        {value.description}
                                    </p>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team/CTA Section */}
            <section className="py-24 bg-slate-50">
                <div className="container text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">Experience the Nutty Difference</h2>
                    <p className="text-lg text-slate-600 mb-10 max-w-2xl mx-auto">
                        Whether you're looking for a quick energy boost or building a custom gift box, we have everything you need to snack smarter.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Button size="lg" className="rounded-full px-10">
                            Shop All Products
                        </Button>
                        <Button variant="secondary" size="lg" className="rounded-full px-10">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;
