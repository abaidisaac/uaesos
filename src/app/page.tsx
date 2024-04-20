"use client";
import { useRouter } from "next/navigation";
import Button from "./components/input/button";
import ActiveCases from "./components/home/activeCases";

export default function Home() {
    const router = useRouter();

    return (
        <main className="h-screen pb-16">
            <div className=""></div>
            <h2 className="uppercase">For users looking to log a request</h2>
            <Button
                type="button"
                text="New Request"
                onClick={() => {
                    router.push("/newcase");
                }}
            />
            <h2 className="uppercase">For users looking to volunteer</h2>
            <Button
                type="button"
                text="Volunteer"
                onClick={() => {
                    router.push("/volunteer");
                }}
            />
            <ActiveCases />
        </main>
    );
}
