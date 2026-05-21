export interface InventoryDay {
    id: number | null;
    date: string;
    is_available: boolean;
    price: number;
    closed: boolean;
}

export interface InventoryUpdate {
    date: string;
    is_available?: boolean;
    price?: number;
    closed?: boolean;
}
