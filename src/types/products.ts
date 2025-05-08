export interface Product {
    id?: number;
    name: string;
    barcode: string;
    price: number;
    unit: string;
    category: string;
    stock_quantity: number;
    min_stock: number;
}