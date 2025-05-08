import { InvoiceItem } from './invoiceItems';

export interface Invoice {
    id?: number;
    customer_name: string;
    date: string;
    total: number;
    items: InvoiceItem[];
}