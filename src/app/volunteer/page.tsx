"use client";
import { useEffect, useState } from "react";
import Map from "../components/map/map";
import { supabase } from "../supabase";
import { LngLatLike } from "mapbox-gl";
import { CheckAuth } from "../lib/auth";
import LoadingAnimation from "../components/loader";
import MyCases from "../components/map/myCases";
import { User } from "@supabase/supabase-js";

export default function Volunteer() {
    const [cases, setCases] = useState<Case[]>();
    const [myCases, setMyCases] = useState<Case[]>();
    const [user, setUser] = useState<User>();
    const [location, setLocation] = useState<LngLatLike>({ lat: 25.25703, lng: 55.3553 });
    const { currentUser } = CheckAuth();

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser);
        }
    }, [currentUser]);

    useEffect(() => {
        fetch();
    }, [user]);

    const fetch = async () => {
        if (user?.id) {
            const values = (await supabase.from("flood_april_2024").select("*")).data;
            setCases(values?.filter((data: Case) => !data.completed && !data.assigned_to));
            setMyCases(values?.filter((data: Case) => !data.completed && data.assigned_to == user?.id));
        }
    };

    const channels = supabase
        .channel("custom-all-channel")
        .on("postgres_changes", { event: "*", schema: "public", table: "flood_april_2024" }, (payload) => {
            fetch();
        })
        .subscribe();

    useEffect(() => {
        if (navigator.geolocation) {
            const success = (position: GeolocationPosition) =>
                setLocation({ lng: position?.coords.longitude!, lat: position.coords.latitude! });
            const error = (error: GeolocationPositionError) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "You denied location access. Please enable location services.";
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
        }
    }, []);

    return cases && myCases && location && user ? (
        <main className="w-screen h-screen p-0">
            <Map cases={cases} location={location} user={user} />
            <MyCases user={user} cases={myCases} />
        </main>
    ) : (
        <main className="items-center justify-center h-screen">
            <LoadingAnimation />
        </main>
    );
}
