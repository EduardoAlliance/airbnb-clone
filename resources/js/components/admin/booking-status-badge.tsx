interface BookingStatusBadgeProps {
    status: string;
}

const statusStyles: Record<string, string> = {
    reserved: 'bg-stitch-secondary-fixed/30 text-stitch-on-secondary-fixed-variant border border-stitch-secondary-fixed',
    confirmed: 'bg-stitch-primary-fixed/30 text-stitch-on-primary-fixed-variant border border-stitch-primary-fixed',
    cancelled: 'bg-stitch-error-container text-stitch-error border border-stitch-error-container',
    completed: 'bg-stitch-surface-container-high text-stitch-on-surface-variant',
};

export function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
    const style = statusStyles[status] ?? 'bg-stitch-surface-container-high text-stitch-on-surface-variant';

    return (
        <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-bold ${style}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
