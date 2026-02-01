/**
 * Glass Card Component
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Reusable glass morphism card
 */

import { motion } from 'framer-motion';

export function GlassCard({
    children,
    className = '',
    hoverable = true,
    onClick,
    as = 'div',
    ...props
}) {
    const Component = motion[as] || motion.div;

    const baseClasses = 'glass-card relative overflow-hidden';
    const hoverClasses = hoverable ? 'cursor-pointer' : '';

    return (
        <Component
            className={`${baseClasses} ${hoverClasses} ${className}`}
            onClick={onClick}
            whileHover={hoverable ? { y: -6, scale: 1.01 } : {}}
            whileTap={hoverable ? { scale: 0.99 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            {...props}
        >
            {/* High-gloss overlay */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute inset-x-0 top-0 h-1/2 opacity-30"
                    style={{
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, transparent 100%)'
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </Component>
    );
}

export function GlassPane({
    children,
    className = '',
    blur = 'normal',
    ...props
}) {
    const blurValues = {
        light: 'backdrop-blur-sm',
        normal: 'backdrop-blur-xl',
        strong: 'backdrop-blur-2xl',
    };

    return (
        <div
            className={`
        bg-white/5 
        ${blurValues[blur]}
        border border-white/10 
        rounded-2xl 
        shadow-lg shadow-black/10
        ${className}
      `}
            {...props}
        >
            {children}
        </div>
    );
}
