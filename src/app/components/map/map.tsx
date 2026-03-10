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

export default function Map(props: { cases: Case[]; location?: [number, number]; heading?: number; user: User }) {
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
        // simple haversine formula for distance in meters
        const haversine = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) => {
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const R = 6371000; // earth radius in m
            const dLat = toRad(lat2 - lat1);
            const dLng = toRad(lng2 - lng1);
            const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

        const clusters: { number: number; cases: Case[]; medical_emergencies: boolean; location: [number, number] }[] = [];
        const threshold = 100; // meters

        props.cases.forEach((c) => {
            if (!c.location) return;
            const loc: [number, number] = [c.location[0], c.location[1]];
            // try to find an existing cluster within threshold
            const existing = clusters.find((g) => haversine(g.location, loc) <= threshold);
            if (existing) {
                existing.cases.push(c);
                existing.number += 1;
                if (c.medical_emergency) existing.medical_emergencies = true;
                // update centroid
                existing.location = [
                    (existing.location[0] * (existing.number - 1) + loc[0]) / existing.number,
                    (existing.location[1] * (existing.number - 1) + loc[1]) / existing.number,
                ];
            } else {
                clusters.push({ number: 1, cases: [c], medical_emergencies: !!c.medical_emergency, location: loc });
            }
        });

        return clusters;
    }, [props.cases]);

    if (!components) {
        return <div className="h-full w-full" />;
    }

    const { MapContainer, TileLayer, Marker, Popup, Pane, useMap } = components as any;
    const L = leafletRef.current;

    // each marker can recenter the map when clicked
    function MapMarker({ position, icon, children }: any) {
        const map = useMap();
        return (
            <Marker
                position={position}
                icon={icon}
                eventHandlers={{
                    click: () => {
                        if (map && position) {
                            map.panTo(position, { animate: true, duration: 0.5 });
                        }
                    },
                }}
            >
                {children}
            </Marker>
        );
    }

    return (
        <div className="h-full w-full">
            <MapContainer
                center={props.location}
                zoom={15}
                className="h-full w-full"
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <Pane name="overlay" style={{ zIndex: 200 }} />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer pane="overlay" url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />

                {props.location && L && (() => {
                    const iconUrl = (navigationIcon as any).src ?? (navigationIcon as unknown as string);
                    if (props.heading != null && L && L.divIcon) {
                        // rotate an image by heading degrees
                        const html = `<img src="${iconUrl}" style="width:28px;height:28px;transform:rotate(${props.heading}deg);"/>`;
                        const rotIcon = L.divIcon({ html, iconSize: [28, 28], className: '' });
                        return <Marker position={props.location} icon={rotIcon} />;
                    }
                    if (L && L.icon) {
                        try {
                            const currentIcon = L.icon({ iconUrl, iconSize: [28, 28], className: 'current-location-icon' });
                            return <Marker position={props.location} icon={currentIcon} />;
                        } catch (err) {
                            return <Marker position={props.location} />;
                        }
                    }
                    return <Marker position={props.location} />;
                })()}

                {grouped.map((p, idx) => {
                    const html = `<div class=\"flex items-center justify-center text-lg rounded-full ${p.medical_emergencies ? "bg-red-600" : "bg-blue-600"
                        }\">${p.number}</div>`;

                    const icon = L && L.divIcon ? L.divIcon({ html, className: "", iconSize: [28, 28] }) : undefined;

                    return (
                        <MapMarker key={idx} position={p.location} icon={icon}>
                            <Popup>
                                <PopUp cases={p.cases} user={props.user} />
                            </Popup>
                        </MapMarker>
                    );
                })}

                {props.location && (() => {
                    function RecenterControl({ location }: { location: [number, number] }) {
                        const map = useMap();
                        return (
                            <button
                                title="Recenter map"
                                onClick={() => {
                                    map.panTo(location, {
                                        animate: true, easeLinearity: 0.25, duration: 1.0,
                                    });
                                }
                                }
                                className="absolute right-5 bottom-20 z-500 bg-white rounded-full shadow p-2 hover:shadow-md focus:outline-none"
                            >
                                <Image src={targetIcon} alt="Recenter" width={24} height={24} />
                            </button>
                        );
                    }
                    return <RecenterControl location={props.location as [number, number]} />;
                })()}
            </MapContainer>


        </div >
    );
}
