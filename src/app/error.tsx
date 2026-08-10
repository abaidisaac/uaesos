"use client";

import { useEffect } from "react";
import ErrorScreen from "./components/errorScreen";

export default function Error({
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
        <ErrorScreen
            title="Something went wrong"
            message="Sorry, an unexpected error occurred. Please try again — if you need urgent help, call your local emergency number."
            onRetry={() => reset()}
        />
    );
}
