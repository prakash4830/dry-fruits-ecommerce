/**
 * Logo Component
 * Premium SVG-based logo for Nutty Bites
 */

import { motion } from 'framer-motion';

export function Logo({ className = '', variant = 'full', iconOnly = false }) {
    // Premium color palette
    const primaryAmber = '#d97706'; // Amber 600
    const secondaryOrange = '#f97316'; // Orange 500
    const darkSlate = '#1e293b'; // Slate 800

    const emblem = (
        <motion.div
            className={`
                ${variant === 'footer' ? 'w-14 h-14' : 'w-10 h-10'}
                relative p-0.5 rounded-full border border-slate-200/50 bg-white/40 backdrop-blur-sm
                shadow-[0_2px_10px_rgba(0,0,0,0.05)]
            `}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <img
                src="/images/nutty_bites_logo.jpg"
                alt="Nutty Bites Logo"
                className="w-full h-full object-contain rounded-full mix-blend-multiply"
            />
        </motion.div>
    );

    if (iconOnly) {
        return <div className={`flex items-center ${className}`}>{emblem}</div>;
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {emblem}
            <span className={`
                font-bold tracking-tight
                ${variant === 'footer' ? 'text-2xl' : 'text-xl'}
                ${variant === 'navbar' ? 'bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent' : 'text-slate-800'}
            `}>
                Nutty<span className="text-amber-600">Bites</span>
            </span>
        </div>
    );
}

export default Logo;
