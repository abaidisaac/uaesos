import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

// When `realtime` is true, the channel subscribes before the initial fetch so no changes
// are missed in between; any postgres change triggers a full refetch.
export function useCases<T>({
    columns,
    table = "cases",
    filterCompleted = true,
    realtime = false,
}: {
    columns: string;
    table?: string;
    filterCompleted?: boolean;
    realtime?: boolean;
}) {
    const [cases, setCases] = useState<T[] | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const cancelledRef = useRef(false);
    const instanceIdRef = useRef(Math.random().toString(36).slice(2));

    const fetchCases = useCallback(async () => {
        try {
            let query = supabase.from(table).select(columns);
            if (filterCompleted) {
                query = query.eq("completed", false);
            }
            const { data, error: fetchError } = await query;
            if (fetchError) throw fetchError;
            if (!cancelledRef.current) {
                setCases((data ?? []) as unknown as T[]);
                setError(null);
            }
        } catch (err) {
            if (!cancelledRef.current) {
                setError(err instanceof Error ? err.message : "Failed to load cases.");
            }
        } finally {
            if (!cancelledRef.current) setLoading(false);
        }
    }, [columns, table, filterCompleted]);

    useEffect(() => {
        cancelledRef.current = false;

        if (!realtime) {
            fetchCases();
            return () => {
                cancelledRef.current = true;
            };
        }

        const channel = supabase
            .channel(`cases-changes-${instanceIdRef.current}`)
            .on("postgres_changes", { event: "*", schema: "public", table }, () => {
                fetchCases();
            })
            .subscribe((status) => {
                if (status === "SUBSCRIBED") {
                    fetchCases();
                }
            });

        return () => {
            cancelledRef.current = true;
            void supabase.removeChannel(channel).catch((err) => {
                console.error("Error removing supabase channel", err);
            });
        };
    }, [realtime, fetchCases, table]);

    return { cases, loading, error, refetch: fetchCases };
}
