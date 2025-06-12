import { DocumentReference, Timestamp } from 'firebase/firestore';

export interface AppointmentRequest {
    id: string;
    comment: string;
    createdAt: Timestamp;
    name: string;
    preferredDate: Timestamp;
    service: DocumentReference[];
    status: string;
    surname: string;
} 