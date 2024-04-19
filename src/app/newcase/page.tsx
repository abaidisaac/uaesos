"use client";
import { useEffect, useRef, useState } from "react";
import FormRadio from "../components/input/formRadio";
import FormTextBox from "../components/input/formTextBox";
import Button from "../components/input/button";
import CurrentLocationMap from "../components/map/currentLocation";
import { LngLatLike } from "mapbox-gl";
import { supabase } from "../supabase";
import { useRouter } from "next/navigation";
import LoadingAnimation from "../components/loader";

export default function Newcase() {
    const [location, setLocation] = useState<LngLatLike>();
    const [success, setSuccess] = useState<boolean>(false);
    const medicalEmergency = useRef();
    const router = useRouter();

    useEffect(() => {
        if (navigator.geolocation) {
            const success = (position: GeolocationPosition) =>
                setLocation({
                    lng: Number(position?.coords.longitude!.toFixed(5)),
                    lat: Number(position.coords.latitude!.toFixed(5)),
                });
            const error = (error: GeolocationPositionError) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage =
                            "You denied location access. Please enable location services to use this feature.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Your location is currently unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Location retrieval timed out. Please try again.";
                        break;
                    default:
                        errorMessage = "An error occurred while retrieving your location.";
                }
                alert(errorMessage);
                router.push("/");
            };
            navigator.geolocation.getCurrentPosition(success, error, { enableHighAccuracy: true, maximumAge: 300 });
        }
    }, []);

    const onSubmit = async (event: any) => {
        event.preventDefault();

        const { data, error } = await supabase
            .from("flood_april_2024")
            .insert([
                {
                    requirement: event.target.requirement.value,
                    phone: event.target["mobile number"].value,
                    author: event.target.name.value,
                    medical_emergency: medicalEmergency.current == "yes" ? true : false,
                    more_details: event.target["more details"].value,
                    location: location,
                },
            ])
            .select();
        if (data) {
            setSuccess(true);
            setTimeout(() => {
                router.push("/");
            }, 5000);
        }
    };

    return location ? (
        <main className="flex p-5 h-full">
            {success ? (
                <h2>A volunteer will reach out to you shortly.</h2>
            ) : (
                <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
                    <FormTextBox required text="Name*"></FormTextBox>
                    <FormTextBox required text="Mobile Number*"></FormTextBox>
                    <FormTextBox required text="Requirement*"></FormTextBox>
                    <FormRadio text="Medical Emergency?*" setData={medicalEmergency} />
                    <FormTextBox required={false} text="More Details" />
                    <div className="flex flex-col gap-2">
                        <h2>Location (Drag pin for accuracy) </h2>
                        {location && <CurrentLocationMap location={location} setLocation={setLocation} />}
                    </div>
                    <Button text="Create Case" type="submit" />
                </form>
            )}
        </main>
    ) : (
        <main className="items-center justify-center h-screen">
            <LoadingAnimation />
        </main>
    );
}
