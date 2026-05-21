export interface PolicyRules {
    before_14_days?: number;
    before_7_days?: number;
    after?: number;
}

export interface AdminBooking {
    id: number;
    guest_name: string;
    guest_email: string;
    property: string;
    check_in: string;
    check_out: string;
    nights: number;
    total: number;
    status: string;
    created_at: string;
}

export interface AdminBookingDetail {
    id: number;
    reservation_id: string;
    status: string;
    check_in: string;
    check_out: string;
    original_check_in: string | null;
    nights: number;
    guests: number;
    subtotal: number;
    total: number;
    created_at: string;
    guest: {
        id: number;
        name: string;
        email: string;
    };
    property: {
        id: number;
        title: string;
        image: string;
    };
    payment: {
        amount: number;
        service_fee: number;
        cleaning_fee: number;
        status: string;
        paid_at: string | null;
        refund_amount: number;
        platform_kept: number;
    } | null;
    payout: {
        host_earnings: number;
        platform_commission: number;
        status: string;
    } | null;
    cancellationPolicy: {
        policy: string;
        policy_name?: string;
        refund_rules?: Record<string, number>;
    } | null;
    refundEstimate: {
        refund_percent: number;
        days_until_checkin: number;
        refund_amount: number;
        platform_retained: number;
    } | null;
    modifications: Array<{
        id: number;
        type: string;
        before: Record<string, unknown>;
        after: Record<string, unknown>;
        amount_change: number;
        payment_method: { brand: string; card_last4: string } | null;
        created_at: string;
    }>;
}
