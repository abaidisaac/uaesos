"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import FormRadio from "../components/input/formRadio";
import FormTextBox from "../components/input/formTextBox";
import Button from "../components/input/button";
const CurrentLocationMap = dynamic(
    () => import("../components/map/currentLocation"),
    { ssr: false }
);
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import "./style.css";
import { useGeolocationWithStatus } from "../lib/location";

export default function Newcase() {
    const [success, setSuccess] = useState<boolean>(false);
    const [medicalEmergency, setMedicalEmergency] = useState<boolean | null>(null);
    const router = useRouter();
    const { position, locationError } = useGeolocationWithStatus();

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const phone = form.get("mobileNumber") as string | null;
        const name = form.get("name") as string | null;
        const detail = form.get("detail") as string | null;

        if (!phone || !name || medicalEmergency === null || !position) {
            // simple client-side validation
            alert("Please fill out all required fields and ensure location is selected.");
            return;
        }

        const { data, error } = await supabase
            .from("cases")
            .insert([
                {
                    phone,
                    author: name,
                    medical_emergency: medicalEmergency,
                    detail: detail ?? "",
                    location: position,
                },
            ])
            .select();
        if (data) {
            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        } else if (error) {
            console.error("Error creating case", error);
            alert("Failed to create case. Please try again.");
        }
    };

    return (
        <main className="flex p-5 h-full">
            {success ? (
                <h2>A volunteer will reach out to you shortly.</h2>
            ) : (
                <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
                    <FormTextBox required text="Name*" name="name" type="name" />
                    <FormTextBox required text="Mobile Number*" placeholder="05XXXXXXXX" name="mobileNumber" type="tel" />
                    <FormTextBox required={false} text="Details" name="detail" />
                    <FormRadio text="Medical Emergency?*" value={medicalEmergency ?? false} onChange={(v: boolean) => setMedicalEmergency(v)} />
                    <div className="flex flex-col gap-2">
                        <h2>Location <p className="text-xs">Drag and drop pin to adjust the pin for best accuracy.</p> </h2>
                        {locationError && <p className="text-red-600 text-sm">{locationError}</p>}
                        <div className="overflow-hidden w-full h-80 rounded-lg">
                            <CurrentLocationMap autoTrack={false} />
                        </div>
                    </div>
                    <Button text="Create Case" type="submit" disabled={!position} />
                </form>
            )}
        </main>
    )
}
