interface Case {
    address?: string;
    id: number;
    author: string;
    phone: string;
    detail: string;
    location?: [number, number];
    medical_emergency: boolean;
    volunteer: string;
    completed: boolean;
    created_at: Date;
    assigned_to_other: boolean;
}

interface LatLng {
    lat: number;
    lng: number;
}
