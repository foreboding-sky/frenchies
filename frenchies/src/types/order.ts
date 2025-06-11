import { DocumentReference } from "firebase/firestore";

export type OrderItem = {
    productId: string;
    productRef: string;
    title: string;
    imageUrl: string;
    priceAtTime: number;
    quantity: number;
};

export type Order = {
    id?: string;
    userId: string;
    userEmail: string;
    userRef: DocumentReference;
    orderNumber: string;
    name: string;
    surname: string;
    address: string;
    city: string;
    phone: string;
    paymentMethod: 'Cash on delivery' | 'Card';
    paymentStatus: 'Not paid' | 'Pending' | 'Paid';
    status: 'pending' | 'processing' | 'shipped' | 'delivered';
    createdAt: any;
    updatedAt: any;
    deliveredAt: string;
    shippedAt: string;
    totalPrice: number;
    currency: string;
    coupon: string;
    items: OrderItem[];
};
