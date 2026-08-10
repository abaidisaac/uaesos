"use client";

import { useEffect } from "react";
import ErrorScreen from "./components/errorScreen";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <html lang="en">
            <body className="bg-black text-white">
                <ErrorScreen
                    title="Something went wrong"
                    message="Sorry, the app hit an unexpected error. Please try again — if you need urgent help, call your local emergency number."
                    onRetry={() => reset()}
                />
            </body>
        </html>
    );
}
