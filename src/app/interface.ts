export interface Case {
    id: number;
    author: string;
    phone: string;
    detail: string;
    location: number[];
    medical_emergency: boolean;
    volunteer: string | null;
    completed: boolean;
    created_at: string;
}
