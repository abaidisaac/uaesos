import Link from "next/link";
import ActiveCases from "./components/home/activeCases";
import PageContainer from "./components/pageContainer";

export default function Home() {
    return (
        <PageContainer className="flex-1">
            <h1 className="text-center">Welcome to UAE SOS</h1>
            <div className="flex flex-col gap-3">
                <Link
                    href="/newcase"
                    className="flex items-center justify-center bg-gray-600 w-full rounded-xl min-h-9 py-1 z-1000 text-white cursor-pointer">
                    Request Help 🆘
                </Link>
                <Link
                    href="/volunteer"
                    className="flex items-center justify-center bg-gray-600 w-full rounded-xl min-h-9 py-1 z-1000 text-white cursor-pointer">
                    Volunteer
                </Link>
            </div>
            <ActiveCases />
        </PageContainer>
    );
}
