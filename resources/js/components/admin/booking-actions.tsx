import { CheckCircle, XCircle } from 'lucide-react';

interface BookingActionsProps {
    status: string;
    onCancel?: () => void;
    onConfirm?: () => void;
}

export function BookingActions({ status, onCancel, onConfirm }: BookingActionsProps) {
    return (
        <div className="flex gap-2">
            {status === 'reserved' && onConfirm && (
                <button
                    onClick={onConfirm}
                    className="p-2 text-stitch-primary hover:bg-stitch-primary-container/20 rounded-full transition-colors"
                    title="Confirm"
                >
                    <CheckCircle className="size-5" />
                </button>
            )}
            {['reserved', 'confirmed'].includes(status) && onCancel && (
                <button
                    onClick={onCancel}
                    className="p-2 text-stitch-error hover:bg-stitch-error-container/20 rounded-full transition-colors"
                    title="Cancel"
                >
                    <XCircle className="size-5" />
                </button>
            )}
        </div>
    );
}
