"use client";
import { useEffect, useState } from "react";
import Map from "../components/map/map";
import { supabase } from "../supabase";
import { LngLatLike } from "mapbox-gl";
import { CheckAuth } from "../lib/auth";

export default function Volunteer() {
    const [cases, setCases] = useState<any[]>();
    const [location, setLocation] = useState<LngLatLike>();
    const { currentUser } = CheckAuth();

    const fetch = async () => {
        const values = (await supabase.from("flood_april_2024").select("*")).data;
        let cases = values?.filter((data: Case) => !data.completed);
        setCases(cases);
    };

    useEffect(() => {
        if (navigator.geolocation) {
            const success = (position: GeolocationPosition) =>
                setLocation({ lng: position?.coords.longitude!, lat: position.coords.latitude! });
            const error = (error: GeolocationPositionError) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage =
                            "You denied location access. Please enable location services to use this feature.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Your location is currently unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location retrieval timed out. Please try again.";
                        break;
                    default:
                        errorMessage = "An error occurred while retrieving your location.";
                }
                alert(errorMessage);
            };
            navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 300 });
            fetch();
        }
        const channels = supabase
            .channel("custom-all-channel")
            .on("postgres_changes", { event: "*", schema: "public", table: "flood_april_2024" }, (payload) => {
                fetch();
            })
            .subscribe();
    }, []);

    return (
        cases &&
        location &&
        currentUser && (
            <main className="w-screen h-screen p-0">
                <Map cases={cases} location={location} user={currentUser} />
            </main>
        )
    );
}
