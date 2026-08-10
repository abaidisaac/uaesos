"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import FormRadio from "../components/input/formRadio";
import FormTextBox from "../components/input/formTextBox";
import Button from "../components/input/button";
import BackButton from "../components/input/backButton";
import PageContainer from "../components/pageContainer";
const CurrentLocationMap = dynamic(
    () => import("../components/map/currentLocation"),
    { ssr: false }
);
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";

export default function Newcase() {
    const [success, setSuccess] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [medicalEmergency, setMedicalEmergency] = useState<boolean | null>(null);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const router = useRouter();
    const redirectTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (redirectTimeout.current) {
                clearTimeout(redirectTimeout.current);
            }
        };
    }, []);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const phone = form.get("mobileNumber") as string | null;
        const name = form.get("name") as string | null;
        const detail = form.get("detail") as string | null;

        if (!phone || !name || medicalEmergency === null || !position) {
            setFormError("Please fill out all required fields and ensure location is selected.");
            return;
        }
        setFormError(null);
        setSubmitting(true);

        const { error } = await supabase
            .from("cases")
            .insert([
                {
                    phone,
                    author: name,
                    medical_emergency: medicalEmergency,
                    detail: detail ?? "",
                    location: position,
                },
            ]);
        if (error) {
            console.error("Error creating case", error);
            setFormError("Failed to create case. Please try again.");
            setSubmitting(false);
            return;
        }
        setSuccess(true);
        redirectTimeout.current = setTimeout(() => {
            router.push("/");
        }, 2000);
    };

    return (
        <PageContainer>
            <BackButton />
            {success ? (
                <h2 className="text-base font-normal">A volunteer will reach out to you shortly.</h2>
            ) : (
                <>
                    <h1>Request Help</h1>
                    <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
                        <FormTextBox required text="Name*" name="name" type="text" autoComplete="name" />
                        <FormTextBox required text="Mobile Number*" placeholder="05XXXXXXXX" name="mobileNumber" type="tel" autoComplete="tel" inputMode="tel" />
                        <FormTextBox required={false} text="Details" name="detail" />
                        <FormRadio text="Medical Emergency?*" value={medicalEmergency} onChange={setMedicalEmergency} />
                        <div className="flex flex-col gap-2">
                            <h2>Location</h2>
                            <p className="text-xs">Drag and drop pin to adjust the pin for best accuracy.</p>
                            {locationError && <p className="text-red-600 text-sm">{locationError}</p>}
                            {formError && <p className="text-red-600 text-sm">{formError}</p>}
                            <div className="overflow-hidden w-full h-80 rounded-lg">
                                <CurrentLocationMap autoTrack={false} onPositionChange={setPosition} onError={setLocationError} />
                            </div>
                        </div>
                        <Button text="Create Case" type="submit" disabled={!position} loading={submitting} />
                    </form>
                </>
            )}
        </PageContainer>
    )
}
