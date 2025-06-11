import { Timestamp } from 'firebase/firestore';

export interface AppointmentRequest {
    id: string;
    comment: string;
    createdAt: Timestamp;
    name: string;
    preferredDate: Timestamp;
    service: string;
    status: string;
    surname: string;
} 