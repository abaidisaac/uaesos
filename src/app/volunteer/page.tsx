"use client";
import { useEffect, useState, useMemo } from "react";
import Map from "../components/map/map";
import { supabase } from "../supabase";
import { CheckAuth } from "../lib/auth";
import LoadingAnimation from "../components/loader";
import MyCases from "../components/map/myCases";
import { User } from "@supabase/supabase-js";
import ActiveCases from "../components/volunteer/listView";

export default function Volunteer() {
    const [cases, setCases] = useState<Case[]>();
    const [myCases, setMyCases] = useState<Case[]>();
    const [user, setUser] = useState<User>();
    const [location, setLocation] = useState<{ lng: number; lat: number }>();
    const [view, setView] = useState<"map" | "list">("list");
    const { currentUser } = CheckAuth();

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser);
        }
    }, [currentUser]);

    useEffect(() => {
        fetchCases();
    }, [user]);

    const fetchCases = async () => {
        if (user?.id) {
            const values = (await supabase.from("cases").select("*").eq("completed", false)).data;
            setCases(values?.filter((data: Case) => !data.completed && !data.volunteer));
            setMyCases(values?.filter((data: Case) => !data.completed && data.volunteer == user?.id));
        }
    };

    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel("custom-all-channel")
            .on("postgres_changes", { event: "*", schema: "public", table: "cases" }, (payload) => {
                fetchCases();
            })
            .subscribe();

        return () => {
            try {
                void supabase.removeChannel(channel);
            } catch (err) {
                console.error("Error removing supabase channel", err);
            }
        };
    }, [user]);

    useEffect(() => {
        if (navigator.geolocation) {
            const success = (position: GeolocationPosition) =>
                setLocation({ lng: position?.coords.longitude!, lat: position.coords.latitude! });
            const error = (error: GeolocationPositionError) => { };
            navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 300 });
        }
    }, []);

    // Combine regular cases and myCases so markers show for both sets
    const mapCases = useMemo(() => {
        const a: Case[] = [];
        if (cases && cases.length) a.push(...cases);
        if (myCases && myCases.length) a.push(...myCases);
        return a;
    }, [cases, myCases]);

    return cases && myCases && user ? (
        <main className={ (view == "map" ? "p-0" : "") + " h-screen w-screen" }>
            { view == "list" ? (
                <ActiveCases user={ user } cases={ cases } myCases={ myCases } setView={ setView } />
            ) : (
                <>
                    <Map cases={ mapCases } location={ location } user={ user } />
                    <MyCases user={ user } cases={ myCases } map setView={ setView } />
                </>
            ) }
        </main>
    ) : (
        <main className="items-center justify-center h-screen">
            <LoadingAnimation />
        </main>
    );
}
