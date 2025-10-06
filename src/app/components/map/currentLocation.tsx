"use client";
import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import LoadingAnimation from "../loader";
import Image from "next/image";
import targetIcon from '@/../public/crosshair.png'
import { loadLeafletModules } from "../../lib/leaflet";
import { useGeolocationWithStatus } from "../../lib/location";

export default function CurrentLocationMap() {
    const [components, setComponents] = useState<any>(null);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const [following, setFollowing] = useState<boolean>(true);
    const mapRef = useRef<any>(null);

    const { position: hookPos, status, startWatch, stopWatch } = useGeolocationWithStatus({ autoRequest: true, autoWatch: true });

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
            } catch (err) {
                console.error("Failed to load leaflet/react-leaflet:", err);
            }
        };

        load();

        return () => {
            mounted = false;
            try { stopWatch(); } catch (e) { /* ignore */ }
        };
    }, [stopWatch]);

    useEffect(() => {
        if (!hookPos) return;
        if (following) {
            setPosition(hookPos);
            if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                try { mapRef.current.panTo(hookPos); } catch (err) { console.error('panTo failed', err); }
            }
        }
    }, [hookPos, following]);

    if (!components || !position) {
        if (hookPos && !position) setPosition(hookPos);
        return <div className="h-full w-full flex items-center justify-center"><LoadingAnimation /></div>;
    }

    const { MapContainer, TileLayer, Marker, Pane } = components as any;

    return (
        <div className="h-full w-full">
            <MapContainer
                whenCreated={ (map: any) => { console.log("Map instance created:", mapRef.current); mapRef.current = map; } }
                center={ position }
                zoom={ 18 }
                scrollWheelZoom={ true }
                zoomControl={ false }
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
                                    setFollowing(false);
                                    if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                                        mapRef.current.panTo(newPos);
                                    }
                                } catch (err) {
                                    console.error('Error handling marker dragend', err);
                                }
                            },
                        } }
                    />
                ) }

                { !following && (
                    <div className="absolute top-2 right-2 z-[500]">
                        <button
                            className="bg-white text-sm text-black p-2 rounded-full shadow cursor-pointer"
                            onClick={ () => {
                                setFollowing(true);
                                if (hookPos) {
                                    setPosition(hookPos);
                                    if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                                        mapRef.current.panTo(hookPos);
                                    }
                                }
                            } }
                        >
                            <Image src={ targetIcon } alt="Recenter" width={ 20 } height={ 20 } />
                        </button>
                    </div>
                ) }
            </MapContainer>
        </div>
    );
}
