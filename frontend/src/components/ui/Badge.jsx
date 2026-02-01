/**
 * Badge Component
 * 
 * Worker: Dev - Status badges with variants
 */

const variants = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    glass: 'badge-glass',
    pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
    confirmed: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    shipped: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    delivered: 'bg-green-500/20 text-green-300 border border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border border-red-500/30',
};

export function Badge({
    children,
    variant = 'glass',
    className = '',
}) {
    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
}

export function StatusBadge({ status }) {
    const statusLabels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
    };

    return (
        <Badge variant={status || 'pending'}>
            {statusLabels[status] || status}
        </Badge>
    );
}
