import { supabase } from "@/app/supabase";
import { useState } from "react";

export default function ActiveCases() {
    const [cases, setCases] = useState<Case[]>();
    const values = async () => (await supabase.from("flood_april_2024").select("*").eq("completed", false)).data;

    values().then((data) => {
        if (data) {
            setCases(data);
        }
    });

    return (
        cases && (
            <section className="flex flex-col gap-3 overflow-hidden">
                <h2>Active Cases</h2>
                <div className=" flex flex-col gap-2 overflow-y-auto">
                    {cases.map((item: Case, index) => (
                        <div
                            key={index}
                            className={(item.assigned_to ? "bg-green-500" : "bg-gray-500") + " p-3 rounded-xl"}>
                            <p className="font-semibold">{item.author}</p>
                            <p>{item.requirement}</p>
                            <p>{item.assigned_to ? "In Progress" : "Pending"}</p>
                        </div>
                    ))}
                </div>
            </section>
        )
    );
}