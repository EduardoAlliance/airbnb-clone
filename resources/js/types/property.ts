export interface AdminProperty {
    id: number;
    title: string;
    slug: string;
    location: string;
    status: 'draft' | 'published';
    base_price: number;
    guests: number;
    bedrooms: number;
    image: string;
    bookings_count: number;
    created_at: string;
}

export interface AdminPropertyDetail {
    id: number;
    title: string;
    slug: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string | null;
    latitude: number | null;
    longitude: number | null;
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    base_price: number;
    cleaning_fee: number;
    status: 'draft' | 'published';
    host: { id: number; name: string; email: string } | null;
    amenities: { id: number; name: string }[];
    images: { id: number; url: string; thumb: string; name: string }[];
    inventory: InventoryDay[];
    bookings: AdminPropertyBooking[];
}

export interface AdminPropertyBooking {
    id: number;
    guest_name: string;
    check_in: string;
    check_out: string;
    total: number;
    status: string;
}

export interface AdminPropertyForm {
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: string;
    longitude: string;
    guests: number;
    bedrooms: number;
    beds: number;
    bathrooms: string;
    base_price: string;
    cleaning_fee: string;
    status: 'draft' | 'published';
    amenities: number[];
    images?: File[];
    remove_images?: number[];
}
