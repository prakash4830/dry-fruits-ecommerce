/**
 * Input Component
 * iOS 26 Liquid Glass design
 * 
 * Worker: Dev - Form input components
 */

import { forwardRef } from 'react';

export const Input = forwardRef(({
    label,
    error,
    className = '',
    type = 'text',
    placeholder = ' ', // Required for peer-placeholder-shown
    ...props
}, ref) => {
    return (
        <div className="relative w-full group">
            <input
                ref={ref}
                type={type}
                placeholder=" "
                className={`
                    input-glass py-4 peer placeholder-transparent
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {label && (
                <label className={`
                    absolute left-4 top-4 text-slate-500 transition-all duration-200 pointer-events-none select-none
                    peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0
                    peer-focus:opacity-0 peer-focus:-translate-y-2
                    opacity-0 -translate-y-2
                `}>
                    {label}
                </label>
            )}
            {error && (
                <p className="mt-1.5 text-sm text-red-400 pl-1">{error}</p>
            )}
            {props.icon && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 peer-focus:text-amber-600 transition-colors">
                    {props.icon}
                </div>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export const TextArea = forwardRef(({
    label,
    error,
    className = '',
    rows = 4,
    placeholder = ' ',
    ...props
}, ref) => {
    return (
        <div className="relative w-full group">
            <textarea
                ref={ref}
                rows={rows}
                placeholder=" "
                className={`
                    input-glass py-3 resize-none peer placeholder-transparent
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            />
            {
                label && (
                    <label className={`
                    absolute left-4 top-4 text-slate-500 transition-all duration-200 pointer-events-none select-none
                    peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0
                    peer-focus:opacity-0 peer-focus:-translate-y-2
                    opacity-0 -translate-y-2
                `}>
                        {label}
                    </label>
                )
            }
            {
                error && (
                    <p className="mt-1.5 text-sm text-red-400 pl-1">{error}</p>
                )
            }
        </div >
    );
});

TextArea.displayName = 'TextArea';

export function Select({
    label,
    error,
    options = [],
    className = '',
    placeholder = 'Select an option',
    ...props
}) {
    return (
        <div className="relative w-full group">
            <select
                className={`
                    input-glass pt-6 pb-2 peer appearance-none
                    ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    ${className}
                `}
                {...props}
            >
                <option value="" disabled selected>{placeholder}</option>
                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        className="bg-white text-slate-800"
                    >
                        {option.label}
                    </option>
                ))}
            </select>
            {label && (
                <label className="absolute left-4 top-1 text-xs font-semibold text-slate-500">
                    {label}
                </label>
            )}
            {error && (
                <p className="mt-1.5 text-sm text-red-400 pl-1">{error}</p>
            )}
        </div>
    );
}
