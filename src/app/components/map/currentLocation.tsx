"use client";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import LoadingAnimation from "../loader";
import { useCurrentLocation } from "../../lib/location";
import { Pane } from "react-leaflet";

export default function CurrentLocationMap() {
    const [components, setComponents] = useState<any>(null);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const mounted = useRef(false);
    const mapRef = useRef<any>(null);

    useEffect(() => {
        mounted.current = true;

        let watcher: number | null = null;

        // Dynamically import leaflet and react-leaflet on the client only.
        const loadLeaflet = async () => {
            try {
                const [LModule, RLModule] = await Promise.all([
                    import("leaflet"),
                    import("react-leaflet"),
                ]);

                const L = (LModule && (LModule as any).default) || LModule;

                const iconUrl = (markerIcon as any).src ?? (markerIcon as unknown as string);
                const iconRetinaUrl = (markerIcon2x as any).src ?? (markerIcon2x as unknown as string);
                const shadowUrl = (markerShadow as any).src ?? (markerShadow as unknown as string);

                // Configure default icon after leaflet is available
                if (L && L.Icon && L.Icon.Default && typeof L.Icon.Default.mergeOptions === "function") {
                    L.Icon.Default.mergeOptions({
                        iconUrl,
                        iconRetinaUrl,
                        shadowUrl,
                    });
                }

                setComponents(RLModule);
            } catch (err) {
                console.error("Failed to load leaflet/react-leaflet:", err);
            }
        };

        loadLeaflet();

        return () => {
            mounted.current = false;
            if (watcher !== null) navigator.geolocation.clearWatch(watcher);
        };
    }, []);

    // Use shared hook for current location
    const hookPos = useCurrentLocation();

    useEffect(() => {
        if (hookPos) {
            setPosition(hookPos);
            // Optionally pan map when the position first becomes available
            if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                mapRef.current.panTo(hookPos);
            }
        }
    }, [hookPos]);
    console.log('hookPos', hookPos);

    if (!components || !position) {
        return <div className="h-full w-full flex items-center justify-center"><LoadingAnimation /></div>;

    }

    const { MapContainer, TileLayer, Marker, } = components as any;

    return (
        <div className="h-full w-full">
            <MapContainer
                whenCreated={ (map: any) => {
                    mapRef.current = map;
                } }
                center={ position }
                zoom={ 15 }
                scrollWheelZoom={ true }
                className="h-full w-full"
            >
                <Pane name="overlay" style={ { zIndex: 200 } } />
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
                <TileLayer
                    pane="overlay"
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                />
                { position && (
                    <Marker
                        position={ position }
                        draggable={ true }
                        eventHandlers={ {
                            dragend: (e: any) => {
                                try {
                                    const marker = e.target;
                                    const latLng = marker.getLatLng();
                                    const newPos: [number, number] = [latLng.lat, latLng.lng];
                                    setPosition(newPos);
                                    // Pan map to the new marker position
                                    if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                                        mapRef.current.panTo(newPos);
                                    }
                                } catch (err) {
                                    // eslint-disable-next-line no-console
                                    console.error('Error handling marker dragend', err);
                                }
                            },
                        } }
                    />
                ) }
            </MapContainer>
        </div>
    );
}
