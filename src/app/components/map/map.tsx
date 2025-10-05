"use client";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef, useState, useMemo } from "react";
import { User } from "@supabase/supabase-js";
import PopUp from "./popUp";

export default function Map(props: { cases: Case[]; location: { lat: number; lng: number } | undefined; user: User }) {
    const [components, setComponents] = useState<any>(null);
    const leafletRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            try {
                const [LModule, RLModule] = await Promise.all([import("leaflet"), import("react-leaflet")]);
                const L = (LModule && (LModule as any).default) || LModule;

                // Configure default icon after leaflet is available
                const iconUrl = (markerIcon as any).src ?? (markerIcon as unknown as string);
                const iconRetinaUrl = (markerIcon2x as any).src ?? (markerIcon2x as unknown as string);
                const shadowUrl = (markerShadow as any).src ?? (markerShadow as unknown as string);

                if (L && L.Icon && L.Icon.Default && typeof L.Icon.Default.mergeOptions === "function") {
                    L.Icon.Default.mergeOptions({
                        iconUrl,
                        iconRetinaUrl,
                        shadowUrl,
                    });
                }

                if (!mounted) return;
                setComponents(RLModule);
                leafletRef.current = L;
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Failed to load leaflet/react-leaflet:", err);
            }
        };
        load();
        return () => {
            mounted = false;
        };
    }, []);

    const grouped = useMemo<
        { number: number; cases: Case[]; medical_emergencies: boolean; lat: number; lng: number }[]
    >(() => {
        const dict: Record<string, { number: number; cases: Case[]; medical_emergencies: boolean; lat: number; lng: number }> = {};
        (props.cases || []).forEach((c) => {
            const lat = Number(c.location?.lat?.toFixed?.(3) ?? 0);
            const lng = Number(c.location?.lng?.toFixed?.(3) ?? 0);
            const key = `${lat},${lng}`;
            if (!dict[key]) {
                dict[key] = { number: 1, cases: [c], medical_emergencies: !!c.medical_emergency, lat, lng };
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

    const { MapContainer, TileLayer, Marker, Popup, Pane } = components as any;
    const L = leafletRef.current;

    const center: [number, number] = props.location ? [props.location.lat, props.location.lng] : [25.188626, 55.372471];
    const zoom = props.location ? 15 : 8;

    return (
        <div className="h-full w-full">
            <MapContainer center={ center } zoom={ zoom } className="h-full w-full" scrollWheelZoom={ true } zoomControl={ false }>
                <Pane name="overlay" style={ { zIndex: 100 } } />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer pane="overlay" url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />

                { grouped.map((p, idx) => {
                    // create a div icon with Tailwind classes
                    const html = `<div class=\"flex items-center justify-center text-lg rounded-full ${p.medical_emergencies ? "bg-red-600" : "bg-blue-600"
                        }\">${p.number}</div>`;

                    const icon = L && L.divIcon ? L.divIcon({ html, className: "", iconSize: [28, 28] }) : undefined;

                    return (
                        <Marker key={ idx } position={ [p.lat, p.lng] } icon={ icon }>
                            <Popup>
                                <PopUp cases={ p.cases } user={ props.user } />
                            </Popup>
                        </Marker>
                    );
                }) }
            </MapContainer>
        </div>
    );
}
