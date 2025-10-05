"use client";
import { useRef, useState } from "react";
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
import { useCurrentLocation } from "../lib/location";

export default function Newcase() {
    const [success, setSuccess] = useState<boolean>(false);
    const medicalEmergency = useRef<string | null>(null);
    const router = useRouter();
    const hookPos = useCurrentLocation();

    const onSubmit = async (event: any) => {
        event.preventDefault();
        const { data, error } = await supabase
            .from("cases")
            .insert([
                {
                    // requirement: event.target.requirement.value,
                    phone: event.target.mobileNumber.value,
                    author: event.target.name.value,
                    medical_emergency: medicalEmergency.current,
                    detail: event.target.detail.value,
                    location: { lat: hookPos?.[0], lng: hookPos?.[1] },
                },
            ])
            .select();
        if (data) {
            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 2000);
        }
    };

    return (
        <main className="flex p-5 h-full">
            { success ? (
                <h2>A volunteer will reach out to you shortly.</h2>
            ) : (
                <form className="w-full flex flex-col gap-8" onSubmit={ onSubmit }>
                    <FormTextBox required text="Name*" name="name" type="name" />
                    <FormTextBox required text="Mobile Number*" placeholder="05XXXXXXXX" name="mobileNumber" type="tel" />
                    <FormTextBox required={ false } text="Details" name="detail" />
                    <FormRadio text="Medical Emergency?*" setData={ medicalEmergency } />
                    <div className="flex flex-col gap-2">
                        <h2>Location (Zoom map and drag pin for accuracy) </h2>
                        <div className="overflow-hidden w-full h-80 rounded-lg">
                            <CurrentLocationMap />
                        </div>
                    </div>
                    <Button text="Create Case" type="submit" />
                </form>
            ) }
        </main>
    )
}
