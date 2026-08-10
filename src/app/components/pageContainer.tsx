export default function PageContainer(props: { children: React.ReactNode; className?: string }) {
    return (
        <main className="min-h-screen w-full flex justify-center p-5">
            <div className={`w-full max-w-md flex flex-col gap-6 ${props.className ?? ""}`}>
                { props.children }
            </div>
        </main>
    );
}
