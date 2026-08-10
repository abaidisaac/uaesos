import Link from "next/link";

export default function NotFound() {
    return (
        <main className="h-screen flex flex-col items-center justify-center gap-4 bg-black text-white text-center p-5">
            <h1 className="text-2xl">Page not found</h1>
            <p>The page you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/" className="bg-gray-600 w-full rounded-xl py-2 text-white">
                Back to home
            </Link>
        </main>
    );
}
