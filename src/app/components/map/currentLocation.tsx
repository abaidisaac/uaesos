"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import LoadingAnimation from "../loader";
import Image from "next/image";
import targetIcon from '@/../public/crosshair.png'
import { useLeaflet } from "../../lib/leaflet";
import { useGeolocationWithStatus } from "../../lib/location";

export default function CurrentLocationMap(props: { autoTrack?: boolean; onPositionChange?: (pos: [number, number]) => void; onError?: (msg: string | null) => void } = {}) {
    const { leaflet, error: leafletError } = useLeaflet();
    const autoTrack = props.autoTrack ?? true;
    // null means "use the GPS fix" instead of a manually dragged pin
    const [manualPosition, setManualPosition] = useState<[number, number] | null>(null);
    const [following, setFollowing] = useState<boolean>(autoTrack);
    const mapRef = useRef<import("leaflet").Map | null>(null);
    const wasFollowingRef = useRef(false);
    const hasPannedOnceRef = useRef(false);

    const { position: hookPos, requestLocation, locationError } = useGeolocationWithStatus({ autoRequest: true, autoWatch: autoTrack });
    const { onPositionChange, onError } = props;

    const position = (following ? hookPos?.coords ?? manualPosition : manualPosition ?? hookPos?.coords) ?? null;

    useEffect(() => {
        if (onError) onError(locationError ?? leafletError);
    }, [locationError, leafletError, onError]);

    useEffect(() => {
        if (!position) return;
        const justStartedFollowing = following && !wasFollowingRef.current;
        if (following && (justStartedFollowing || !hasPannedOnceRef.current)) {
            mapRef.current?.panTo(position);
            hasPannedOnceRef.current = true;
        }
        wasFollowingRef.current = following;
    }, [position, following]);

    useEffect(() => {
        if (position) onPositionChange?.(position);
    }, [position, onPositionChange]);

    if (leafletError) {
        return (
            <div className="h-full w-full flex items-center justify-center p-4 text-center text-sm text-red-600">
                Failed to load the map: {leafletError}
            </div>
        );
    }

    if (!leaflet || !position) {
        return <div className="h-full w-full flex items-center justify-center"><LoadingAnimation /></div>;
    }

    const { MapContainer, TileLayer, Marker, Pane } = leaflet.RL;

    return (
        <div className="h-full w-full relative">
            <MapContainer
                ref={mapRef}
                center={position}
                zoom={18}
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full"
            >
                <Pane name="overlay" style={{ zIndex: 200 }} />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer
                    pane="overlay"
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                />
                {position && (
                    <Marker
                        position={position}
                        draggable={true}
                        eventHandlers={{
                            dragend: (event) => {
                                try {
                                    const marker = event.target;
                                    const latLng = marker.getLatLng();
                                    const newPos: [number, number] = [latLng.lat, latLng.lng];
                                    setManualPosition(newPos);
                                    setFollowing(false);
                                } catch (err) {
                                    console.error('Error handling marker dragend', err);
                                }
                            },
                        }}
                    />
                )}
            </MapContainer>

            {!following && (
                <div className="absolute top-2 right-2 z-500">
                    <button
                        type="button"
                        aria-label="Recenter map on current location"
                        className="bg-white text-sm text-black p-2 rounded-full shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
                        onClick={() => {
                            setManualPosition(null);
                            setFollowing(true);
                            if (!hookPos) requestLocation();
                        }}
                    >
                        <Image src={targetIcon} alt="" width={20} height={20} />
                    </button>
                </div>
            )}

            <div className="absolute bottom-4 right-4 z-600">
                <button
                    title="Center on current location"
                    type="button"
                    aria-label="Center map on current location"
                    className="bg-white p-2 rounded-full shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 cursor-pointer"
                    onClick={() => {
                        setManualPosition(null);
                        setFollowing(true);
                        requestLocation();
                    }}
                >
                    <Image src={targetIcon} alt="" width={24} height={24} />
                </button>
            </div>
        </div>
    );
}
