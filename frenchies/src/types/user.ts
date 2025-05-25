import { Timestamp } from "firebase/firestore";

export interface UserProfile {
    name: string;
    surname: string;
    email: string;
    phone: string;
    isAdmin: boolean;
    createdAt: Timestamp;
}