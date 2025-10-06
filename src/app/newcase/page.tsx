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
import { useGeolocationWithStatus } from "../lib/location";

export default function Newcase() {
    const [success, setSuccess] = useState<boolean>(false);
    const medicalEmergency = useRef<string | null>(null);
    const router = useRouter();
    const { position, status, locationError, requestLocation } = useGeolocationWithStatus();

    const onSubmit = async (event: any) => {
        event.preventDefault();

        const { data, error } = await supabase
            .from("cases")
            .insert([
                {
                    phone: event.target.mobileNumber.value,
                    author: event.target.name.value,
                    medical_emergency: medicalEmergency.current,
                    detail: event.target.detail.value,
                    location: position,
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
                        <h2>Location <p className="text-xs">Drag and drop pin to adjust the pin for best accuracy.</p> </h2>
                        { locationError && <p className="text-red-600 text-sm">{ locationError }</p> }
                        <div className="overflow-hidden w-full h-80 rounded-lg">
                            <CurrentLocationMap />
                        </div>
                    </div>
                    <Button text="Create Case" type="submit" disabled={ !position } />
                </form>
            ) }
        </main>
    )
}
