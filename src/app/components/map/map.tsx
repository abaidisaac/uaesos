"use client";
import type { Case } from "@/app/interface";
import "leaflet/dist/leaflet.css";
import "./mapIcons.css";
import type { DivIcon, Icon } from "leaflet";
import type { ReactNode } from "react";
import { useMemo } from "react";
import { User } from "@supabase/supabase-js";
import PopUp from "./popUp";
import navigationIcon from '@/../public/navigationIcon.png';
import { useLeaflet, imageSrc, type UseLeafletResult } from "../../lib/leaflet";
import targetIcon from '@/../public/crosshair.png';
import Image from "next/image";

const DEFAULT_LOCATION: [number, number] = [25.2048, 55.2708];

function createMapHelpers(RL: NonNullable<UseLeafletResult>["RL"]) {
    const { useMap, Marker } = RL;

    function MapMarker({ position, icon, children }: { position: [number, number]; icon?: DivIcon | Icon; children?: ReactNode }) {
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

    function RecenterControl({ location }: { location: [number, number] }) {
        const map = useMap();
        return (
            <button
                title="Recenter map"
                aria-label="Recenter map on current location"
                onClick={() => {
                    map.panTo(location, {
                        animate: true, easeLinearity: 0.25, duration: 1.0,
                    });
                }}
                className="absolute right-5 bottom-20 z-500 bg-white rounded-full shadow p-2 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            >
                <Image src={targetIcon} alt="" width={24} height={24} />
            </button>
        );
    }

    return { MapMarker, RecenterControl };
}

export default function Map(props: { cases: Case[]; location?: [number, number]; heading?: number; user: User }) {
    const { leaflet, error } = useLeaflet();

    const grouped = useMemo<
        { number: number; cases: Case[]; medical_emergencies: boolean; location: [number, number] }[]
    >(() => {
        const haversine = ([lat1, lng1]: [number, number], [lat2, lng2]: [number, number]) => {
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const R = 6371000;
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
        const threshold = 100;

        props.cases.forEach((c) => {
            if (!c.location) return;
            const loc: [number, number] = [c.location[0], c.location[1]];
            const existing = clusters.find((g) => haversine(g.location, loc) <= threshold);
            if (existing) {
                existing.cases.push(c);
                existing.number += 1;
                if (c.medical_emergency) existing.medical_emergencies = true;
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

    const helpers = useMemo(() => (leaflet ? createMapHelpers(leaflet.RL) : null), [leaflet]);

    const clusterIcons = useMemo(() => {
        const icons: Record<number, DivIcon> = {};
        if (!leaflet?.L.divIcon) return icons;
        grouped.forEach((p) => {
            const className = p.medical_emergencies ? "map-cluster-badge map-cluster-badge--medical" : "map-cluster-badge map-cluster-badge--general";
            const html = `<div class="${className}">${p.number}</div>`;
            icons[p.cases[0].id] = leaflet.L.divIcon({ html, className: "", iconSize: [28, 28] });
        });
        return icons;
    }, [leaflet, grouped]);

    const hasLocation = props.location != null;
    const currentLocationIcon = useMemo<DivIcon | Icon | undefined>(() => {
        if (!hasLocation || !leaflet?.L.divIcon) return undefined;
        const iconUrl = imageSrc(navigationIcon);
        if (props.heading != null) {
            const html = `<img src="${iconUrl}" class="map-icon-nav" style="transform:rotate(${props.heading}deg);"/>`;
            return leaflet.L.divIcon({ html, iconSize: [28, 28], className: '' });
        }
        try {
            return leaflet.L.icon({ iconUrl, iconSize: [28, 28], className: 'current-location-icon' });
        } catch {
            return undefined;
        }
    }, [leaflet, hasLocation, props.heading]);

    if (error) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 text-center text-sm text-red-600">
                Failed to load the map: {error}
            </div>
        );
    }

    if (!leaflet || !helpers) {
        return <div className="h-full w-full" />;
    }

    const { MapContainer, TileLayer, Marker, Popup, Pane } = leaflet.RL;
    const { MapMarker, RecenterControl } = helpers;

    const center = props.location ?? DEFAULT_LOCATION;

    return (
        <div className="h-full w-full">
            <MapContainer
                center={center}
                zoom={15}
                className="h-full w-full"
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <Pane name="overlay" style={{ zIndex: 200 }} />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer pane="overlay" url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" />

                {props.location && <Marker position={props.location} icon={currentLocationIcon} />}

                {grouped.map((p) => (
                    <MapMarker key={p.cases[0].id} position={p.location} icon={clusterIcons[p.cases[0].id]}>
                        <Popup>
                            <PopUp cases={p.cases} user={props.user} />
                        </Popup>
                    </MapMarker>
                ))}

                {props.location && (
                    <RecenterControl location={props.location} />
                )}
            </MapContainer>


        </div >
    );
}
