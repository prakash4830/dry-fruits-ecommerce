/**
 * Product Grid Component
 * 
 * Worker: Dev - Responsive product grid layout
 */

import { motion } from 'framer-motion';
import { ProductCard, ProductCardSkeleton } from './ProductCard';

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export function ProductGrid({ products, isLoading, columns = 4 }) {
    const gridCols = {
        2: 'grid-cols-1 sm:grid-cols-2',
        3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
    };

    if (isLoading) {
        return (
            <div className={`grid ${gridCols[columns]} gap-6`}>
                {[...Array(8)].map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (!products?.length) {
        return (
            <div className="glass p-12 text-center">
                <span className="text-4xl mb-4 block">🔍</span>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-white/60">
                    Try adjusting your filters or search terms.
                </p>
            </div>
        );
    }

    return (
        <motion.div
            className={`grid ${gridCols[columns]} gap-6`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {products.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} />
                </motion.div>
            ))}
        </motion.div>
    );
}
