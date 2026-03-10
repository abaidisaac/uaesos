import { supabase } from "@/app/supabase";
import { useState, useEffect } from "react";

export default function ActiveCases() {
    const [cases, setCases] = useState<Case[]>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let cancelled = false;
        const fetchData = async () => {
            try {
                const { data } = await supabase.from("cases").select("*").eq("completed", false);
                if (!cancelled && data) {
                    setCases(data as Case[]);
                }
            } catch (err) {
                console.error("Failed to load active cases", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) {
        return null; // or a spinner
    }

    return (
        cases && (
            <section className="flex flex-col gap-3 overflow-hidden">
                <h2 className="uppercase">Updates on active cases</h2>
                <div className=" flex flex-col gap-2 overflow-y-auto text-sm">
                    {cases.map((item: Case) => (
                        <a
                            href="/volunteer"
                            key={item.id}
                            className={
                                (item.volunteer ? "bg-green-500" : "bg-gray-500") +
                                " p-3 rounded-xl text-white no-underline"
                            }>
                            <p className="font-semibold">{item.author}</p>
                            <p>{item.detail}</p>
                            <p>{item.volunteer ? "In Progress" : "Pending"}</p>
                        </a>
                    ))}
                </div>
            </section>
        )
    );
}
