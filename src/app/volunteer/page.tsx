"use client";
import type { Case } from "@/app/interface";
import { useMemo, useState } from "react";
import Map from "../components/map/map";
import { useAuth } from "../lib/auth";
import { useCases } from "../lib/useCases";
import LoadingAnimation from "../components/loader";
import MyCases from "../components/map/myCases";
import ListView from "../components/volunteer/listView";
import { useGeolocationWithStatus } from "../lib/location";

const WATCH_OPTIONS: PositionOptions = { enableHighAccuracy: true, maximumAge: 300, timeout: 5000 };

export default function Volunteer() {
    const [view, setView] = useState<"map" | "list">("list");
    const { currentUser: user, loading: authLoading } = useAuth();
    const userId = user?.id;

    const { cases: allCases, error: fetchError, refetch } = useCases<Case>({
        columns: "*",
        realtime: true,
    });

    const { position: location } = useGeolocationWithStatus({
        autoRequest: true,
        autoWatch: true,
        watchOptions: WATCH_OPTIONS,
    });

    const cases = useMemo(() => (allCases ?? []).filter((item) => !item.volunteer), [allCases]);
    const myCases = useMemo(
        () => (allCases ?? []).filter((item) => item.volunteer === userId),
        [allCases, userId],
    );
    const mapCases = useMemo(() => [...cases, ...myCases], [cases, myCases]);

    if (authLoading || !user) {
        return (
            <main className="flex items-center justify-center h-screen">
                <LoadingAnimation />
            </main>
        );
    }

    if (fetchError) {
        return (
            <main className="flex flex-col items-center justify-center h-screen gap-4 text-center p-5">
                <p className="text-red-600 text-sm">Could not load cases. {fetchError}</p>
                <button className="bg-gray-600 rounded-xl py-2 px-4 text-white cursor-pointer" onClick={() => refetch()}>
                    Retry
                </button>
            </main>
        );
    }

    if (!allCases) {
        return (
            <main className="flex items-center justify-center h-screen">
                <LoadingAnimation />
            </main>
        );
    }

    return (
        <main className="h-screen w-screen flex justify-center">
            <div className={`h-full w-full max-w-3xl flex flex-col ${view == "list" ? "p-5 gap-2" : ""}`}>
                {view == "list" ? (
                    <ListView user={user} cases={cases} myCases={myCases} setView={setView} />
                ) : (
                    <div className="flex h-full relative">
                        <Map cases={mapCases} location={location?.coords} heading={location?.heading} user={user} />
                        <MyCases user={user} cases={myCases} setView={setView} />
                    </div>
                )}
            </div>
        </main>
    );
}
