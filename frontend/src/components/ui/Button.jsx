/**
 * Button Component
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Reusable button component with variants
 */

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
};

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    className = '',
    icon,
    iconPosition = 'left',
    ...props
}) {
    const isDisabled = disabled || isLoading;

    return (
        <motion.button
            className={`
        btn 
        ${variants[variant]} 
        ${sizes[size]} 
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
            disabled={isDisabled}
            whileHover={!isDisabled ? { scale: 1.02 } : {}}
            whileTap={!isDisabled ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && <span className="w-4 h-4">{icon}</span>}
                    {children}
                    {icon && iconPosition === 'right' && <span className="w-4 h-4">{icon}</span>}
                </>
            )}
        </motion.button>
    );
}

export function IconButton({
    children,
    variant = 'ghost',
    size = 'md',
    className = '',
    ...props
}) {
    const iconSizes = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-3',
    };

    return (
        <motion.button
            className={`
        inline-flex items-center justify-center
        rounded-full
        ${variants[variant]}
        ${iconSizes[size]}
        ${className}
      `}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            {...props}
        >
            {children}
        </motion.button>
    );
}
