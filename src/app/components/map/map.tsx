"use client";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import PopUp from "./popUp";
import navigationIcon from '@/../public/navigationIcon.png';
import { loadLeafletModules } from "../../lib/leaflet";
import targetIcon from '@/../public/crosshair.png';
import Image from "next/image";

export default function Map(props: { cases: Case[]; location: [number, number] | undefined; user: User }) {
    const [components, setComponents] = useState<any>(null);
    const leafletRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const { L, RLModule } = await loadLeafletModules();

                const iconUrl = (markerIcon as any).src ?? (markerIcon as unknown as string);
                const iconRetinaUrl = (markerIcon2x as any).src ?? (markerIcon2x as unknown as string);
                const shadowUrl = (markerShadow as any).src ?? (markerShadow as unknown as string);

                if (L && L.Icon && L.Icon.Default && typeof L.Icon.Default.mergeOptions === "function") {
                    L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
                }

                if (!mounted) return;
                setComponents(RLModule);
                leafletRef.current = L;
            } catch (err) {
                console.error("Failed to load leaflet/react-leaflet:", err);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);


    const grouped = useMemo<
        { number: number; cases: Case[]; medical_emergencies: boolean; location: [number, number] }[]
    >(() => {
        const dict: Record<string, { number: number; cases: Case[]; medical_emergencies: boolean; location: [number, number] }> = {};
        (props.cases || []).forEach((c) => {
            const lat = Number(c.location?.[0]?.toFixed?.(3) ?? 0);
            const lng = Number(c.location?.[1]?.toFixed?.(3) ?? 0);
            const key = `${lat},${lng}`;
            if (!dict[key]) {
                dict[key] = { number: 1, cases: [c], medical_emergencies: !!c.medical_emergency, location: [lat, lng] };
            } else {
                const existing = dict[key];
                existing.number += 1;
                existing.cases.push(c);
                if (!existing.medical_emergencies && c.medical_emergency) existing.medical_emergencies = true;
            }
        });
        return Object.keys(dict).map((k) => dict[k]);
    }, [props.cases]);

    if (!components) {
        return <div className="h-full w-full" />;
    }

    const { MapContainer, TileLayer, Marker, Popup, Pane, useMap } = components as any;
    const L = leafletRef.current;


    return (
        <div className="h-full w-full">
            <MapContainer
                center={ props.location }
                zoom={ 12 }
                className="h-full w-full"
                scrollWheelZoom={ true }
                zoomControl={ false }
            >
                <Pane name="overlay" style={ { zIndex: 200 } } />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer pane="overlay" url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />

                { props.location && L && L.icon && (() => {
                    try {
                        const iconUrl = (navigationIcon as any).src ?? (navigationIcon as unknown as string);
                        const currentIcon = L.icon({ iconUrl, iconSize: [28, 28], className: 'current-location-icon' });
                        return <Marker position={ props.location } icon={ currentIcon } />;
                    } catch (err) {

                        return <Marker position={ props.location } />;
                    }
                })() }

                { grouped.map((p, idx) => {
                    const html = `<div class=\"flex items-center justify-center text-lg rounded-full ${p.medical_emergencies ? "bg-red-600" : "bg-blue-600"
                        }\">${p.number}</div>`;

                    const icon = L && L.divIcon ? L.divIcon({ html, className: "", iconSize: [28, 28] }) : undefined;

                    return (
                        <Marker key={ idx } position={ p.location } icon={ icon }>
                            <Popup>
                                <PopUp cases={ p.cases } user={ props.user } />
                            </Popup>
                        </Marker>
                    );
                }) }

                { props.location && (() => {
                    function RecenterControl({ location }: { location: [number, number] }) {
                        const map = useMap();
                        return (
                            <button
                                title="Recenter map"
                                onClick={ () => {
                                    map.panTo(location, {
                                        animate: true, easeLinearity: 0.25, duration: 1.0,
                                    });
                                }
                                }
                                className="absolute right-5 bottom-10 z-500 bg-white rounded-full shadow p-2 hover:shadow-md focus:outline-none"
                            >
                                <Image src={ targetIcon } alt="Recenter" width={ 20 } height={ 20 } />
                            </button>
                        );
                    }
                    return <RecenterControl location={ props.location as [number, number] } />;
                })() }
            </MapContainer>


        </div >
    );
}
