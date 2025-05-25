export interface Product {
    id: string;
    brand: string;
    categoryId: string;
    categoryRef: string;
    createdAt: any;
    description: string;
    discount: number;
    featured: boolean;
    images: string[];
    isActive: boolean;
    price: number;
    sku: string;
    stock: number;
    tags: string[];
    title: string;
}
