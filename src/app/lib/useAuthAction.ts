"use client";
import { useState } from "react";

export function useAuthAction(action: (form: FormData) => Promise<void>) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        const form = new FormData(event.currentTarget);
        try {
            await action(form);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return { onSubmit, loading, error, setError };
}
