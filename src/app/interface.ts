interface Case {
    id: number;
    author: string;
    phone: string;
    requirement: string;
    more_details: string;
    location?: { lat: number; lng: number };
    medical_emergency: boolean;
    assigned_to: string;
    completed: boolean;
    created_at: Date;
}
