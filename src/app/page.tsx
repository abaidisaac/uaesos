"use client";
import { useRouter } from "next/navigation";
import Button from "./components/input/button";

export default function Home() {
    const router = useRouter();

    return (
        <main className="h-screen">
            <Button
                type="button"
                text="New Request"
                onClick={() => {
                    router.push("/newcase");
                }}
            />
            <Button
                type="button"
                text="Volunteer"
                onClick={() => {
                    router.push("/volunteer");
                }}
            />
        </main>
    );
}
