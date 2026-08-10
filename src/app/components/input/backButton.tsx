"use client";
import { useRouter } from "next/navigation";

export default function BackButton(props: { fallback?: string }) {
    const router = useRouter();

    return (
        <button
            type="button"
            aria-label="Go back"
            className="flex shrink-0 items-center justify-center w-9 h-9 rounded-full bg-gray-600 text-white cursor-pointer"
            onClick={() => {
                if (window.history.length > 1) {
                    router.back();
                } else {
                    router.push(props.fallback ?? "/");
                }
            }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M15 18l-6-6 6-6" />
            </svg>
        </button>
    );
}
