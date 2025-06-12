import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface Service {
    id: string;
    currency: string;
    title: string;
    duration: number;
    price: number;
    description: string;
    isActive: boolean;
    image: string;
} 