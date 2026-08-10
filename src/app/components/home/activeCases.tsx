"use client";
import type { Case } from "@/app/interface";
import Link from "next/link";
import { useCases } from "@/app/lib/useCases";
import LoadingAnimation from "../loader";

// Public home page: only non-sensitive columns from "cases_public", never the base "cases" table.
type PublicCase = Pick<Case, "id" | "author" | "detail" | "volunteer">;

export default function ActiveCases() {
    const { cases, loading } = useCases<PublicCase>({
        columns: "id, author, detail, volunteer",
        table: "cases_public",
        filterCompleted: false,
    });

    if (loading) {
        return <LoadingAnimation />;
    }

    if (!cases?.length) {
        return (
            <section className="flex flex-col gap-3 overflow-hidden">
                <h2 className="uppercase">Updates on active cases</h2>
                <p className="text-sm">No active cases right now.</p>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-3 overflow-hidden">
            <h2 className="uppercase">Updates on active cases</h2>
            <div className=" flex flex-col gap-2 overflow-y-auto text-sm">
                {cases.map((item) => (
                    <Link
                        href="/volunteer"
                        key={item.id}
                        className={
                            (item.volunteer ? "bg-green-500" : "bg-gray-500") +
                            " p-3 rounded-xl text-white no-underline"
                        }>
                        <p className="font-semibold">{item.author}</p>
                        <p>{item.detail}</p>
                        <p>{item.volunteer ? "In Progress" : "Pending"}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}
