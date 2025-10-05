import { useGeolocated } from "react-geolocated";
import { useMemo } from "react";

export function useCurrentLocation() {
    const { coords } = useGeolocated({
        positionOptions: {
            enableHighAccuracy: true,
        },
        userDecisionTimeout: 5000,
    });

    const position = useMemo(() => {
        if (!coords) return null;
        return [coords.latitude, coords.longitude] as [number, number];
    }, [coords]);

    return position;
}

