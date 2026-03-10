interface Case {
    address?: string;
    id: number;
    author: string;
    phone: string;
    detail: string;
    // Geolocation should always be a pair of numbers once created
    location: [number, number];
    medical_emergency: boolean;
    // volunteer can be null if unassigned
    volunteer: string | null;
    completed: boolean;
    // Supabase returns timestamps as strings
    created_at: string;
    assigned_to_other?: boolean;
}

interface LatLng {
    lat: number;
    lng: number;
}
