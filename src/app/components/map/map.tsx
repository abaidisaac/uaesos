"use client";
import mapboxgl, { LngLatLike, Marker, Popup } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import navigationIcon from "@/../public/navigationIcon.png";
import { createRoot } from "react-dom/client";
import Image from "next/image";
import { User } from "@supabase/supabase-js";
import PopUp from "./popUp";

export default function Map(props: { cases: any; location: LngLatLike | undefined; user: User }) {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map>();
    const points = useRef<
        Record<
            string,
            { number: number; marker: Marker | null; popUp: Popup | null; cases: any[]; medical_emergencies: boolean }
        >
    >({});

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX!;

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                dragRotate: false,
                container: mapContainer.current!,
                style: "mapbox://styles/mapbox/streets-v12",
                attributionControl: false,
                center: props.location || { lat: 25.188626, lng: 55.372471 },
                zoom: props.location ? 15 : 8,
            });

            if (props.location) {
                const node = document.createElement("div");
                createRoot(node).render(<Image alt="location" src={navigationIcon} width={30}></Image>);
                new mapboxgl.Marker(node).setLngLat(props.location).addTo(map.current);
            }
        }
        if (map.current) {
            if (Object.keys(points.current).length) {
                for (const key in points.current) {
                    points.current[key].marker?.remove();
                }
            }
            points.current = {};

            props.cases.map((newCase: Case) => {
                const location = { lat: newCase.location!.lat.toFixed(3), lng: newCase.location!.lng.toFixed(3) };

                if (points.current[JSON.stringify(location)] === undefined) {
                    points.current[JSON.stringify(location)] = {
                        number: 1,
                        marker: null,
                        popUp: null,
                        cases: [newCase],
                        medical_emergencies: newCase.medical_emergency ? true : false,
                    };
                } else {
                    points.current[JSON.stringify(location)].number += 1;
                    points.current[JSON.stringify(location)].cases.push(newCase);
                    points.current[JSON.stringify(location)].marker?.remove();
                    if (!points.current[JSON.stringify(location)].medical_emergencies) {
                        points.current[JSON.stringify(location)].medical_emergencies = newCase.medical_emergency
                            ? true
                            : false;
                    }
                }

                const markerNode = document.createElement("div");
                if (points.current[JSON.stringify(location)].medical_emergencies) {
                    createRoot(markerNode).render(
                        <div className="flex items-center justify-center h-7 w-7 text-lg bg-red-600 rounded-full">
                            {points.current[JSON.stringify(location)].number}
                        </div>
                    );
                } else {
                    createRoot(markerNode).render(
                        <div className="flex items-center justify-center w-7 h-7 text-lg bg-blue-600 rounded-full">
                            {points.current[JSON.stringify(location)].number}
                        </div>
                    );
                }
                const popUpNode = document.createElement("div");
                createRoot(popUpNode).render(
                    <PopUp cases={points.current[JSON.stringify(location)].cases} user={props.user} />
                );
                const popUp = new mapboxgl.Popup({ className: "rounded-xl" }).setDOMContent(popUpNode).setOffset();

                points.current[JSON.stringify(location)].popUp = popUp;
                points.current[JSON.stringify(location)].marker = new mapboxgl.Marker({
                    element: markerNode,
                })
                    .setLngLat(newCase.location!)
                    .setPopup(popUp)
                    .addTo(map.current!);
            });
        }
    }, [props.cases]);
    return <div className="h-full w-full rounded-xl" ref={mapContainer}></div>;
}
