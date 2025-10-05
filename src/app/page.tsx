"use client";
import { useRouter } from "next/navigation";
import Button from "./components/input/button";
import ActiveCases from "./components/home/activeCases";

export default function Home() {
    const router = useRouter();

    return (
        <main className="h-screen mt-5">
            <h1 className="text-center">Welcome to SOS UAE</h1>
            {/* <p>SOS UAE aims to connect those in need with those who can help.</p> */}
            <div className="">
                {/* <h2 className="uppercase">For users looking to log a request</h2> */ }
                <Button
                    type="button"
                    text="Request Help 🆘"
                    onClick={ () => {
                        router.push("/newcase");
                    } }
                />
            </div>
            <div>
                {/* <h2 className="uppercase">For users looking to volunteer</h2> */ }
                <Button
                    type="button"
                    text="Volunteer"
                    onClick={ () => {
                        router.push("/volunteer");
                    } }
                />
            </div>
            <ActiveCases />
        </main>
    );
}
