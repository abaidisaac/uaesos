export default function ErrorScreen(props: { title: string; message: string; onRetry: () => void }) {
    return (
        <main className="h-screen flex flex-col items-center justify-center gap-4 bg-black text-white text-center p-5">
            <h1 className="text-2xl">{props.title}</h1>
            <p>{props.message}</p>
            <button className="bg-gray-600 w-full rounded-xl py-2 text-white" onClick={() => props.onRetry()}>
                Retry
            </button>
        </main>
    );
}
