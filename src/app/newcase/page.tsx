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
import { Autocomplete, useLoadScript } from "@react-google-maps/api";
import "./style.css";

export default function Newcase() {
    const [location, setLocation] = useState<LngLatLike>({ lat: 25.25703, lng: 55.3553 });
    const [success, setSuccess] = useState<boolean>(false);
    const autocompleteRef = useRef<any>();
    const medicalEmergency = useRef();
    const router = useRouter();

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: "AIzaSyA4yf_AWLIvDCUI5KG_iSTp4dYppSmMSoQ",
        libraries: ["places"],
    });

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        console.log(place.geometry.location.lat());
        setLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
        });
    };

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
                        errorMessage = "You denied location access. Please enable location services.";
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
            }, 4000);
        }
    };

    return location && isLoaded ? (
        <main className="flex p-5 h-full">
            {success ? (
                <h2>A volunteer will reach out to you shortly.</h2>
            ) : (
                <form className="w-full flex flex-col gap-8" onSubmit={onSubmit}>
                    <FormTextBox required text="Name*"></FormTextBox>
                    <FormTextBox required text="Mobile Number*" placeholder="05XXXXXXXX"></FormTextBox>
                    <FormTextBox required text="Requirement*"></FormTextBox>
                    <FormRadio text="Medical Emergency?*" setData={medicalEmergency} />
                    <FormTextBox required={false} text="More Details" />
                    <div className="flex flex-col gap-2">
                        <h2>Location (Zoom map and drag pin for accuracy) </h2>
                        <Autocomplete
                            restrictions={{ country: "ae" }}
                            onLoad={(autocomplete) => {
                                autocompleteRef.current = autocomplete;
                            }}
                            onPlaceChanged={handlePlaceChanged}
                            options={{ fields: ["address_components", "geometry", "name"] }}>
                            <input type="text" placeholder="Search for a location" />
                        </Autocomplete>

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
