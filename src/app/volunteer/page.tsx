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
    const [location, setLocation] = useState<LngLatLike>();
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
            const values = (await supabase.from("flood_april_2024").select("*").eq("completed", false)).data;
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
            const error = (error: GeolocationPositionError) => {};
            navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 300 });
        }
    }, []);

    return cases && myCases && user ? (
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
