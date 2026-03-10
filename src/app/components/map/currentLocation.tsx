"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import LoadingAnimation from "../loader";
import Image from "next/image";
import targetIcon from '@/../public/crosshair.png'
import { loadLeafletModules } from "../../lib/leaflet";
import { useGeolocationWithStatus } from "../../lib/location";

export default function CurrentLocationMap(props: { autoTrack?: boolean } = {}) {
    const [components, setComponents] = useState<any>(null);
    const [position, setPosition] = useState<[number, number] | null>(null);
    const autoTrack = props.autoTrack ?? true;
    const [following, setFollowing] = useState<boolean>(autoTrack);
    const [recenterRequested, setRecenterRequested] = useState<boolean>(false);
    const mapRef = useRef<any>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);

    const { position: hookPos, status, requestLocation, startWatch, stopWatch } = useGeolocationWithStatus({ autoRequest: autoTrack, autoWatch: autoTrack });

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

    // start the geolocation watcher only if tracking is enabled
    useEffect(() => {
        if (!autoTrack) return;
        startWatch({ enableHighAccuracy: true, maximumAge: 300, timeout: 5000 });
        return () => {
            try { stopWatch(); } catch { }
        };
    }, [autoTrack, startWatch, stopWatch]);

    useEffect(() => {
        if (!hookPos) return;
        const coords = hookPos.coords;
        if (autoTrack && following) {
            setPosition(coords);
            if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                try { mapRef.current.panTo(coords); } catch (err) { console.error('panTo failed', err); }
            }
        }
        // If a recenter was requested while we were acquiring permission/location,
        // pan to the now-available hookPos.  Keep the request flag until we actually
        // have a map instance and can pan, so that later creation callback can also
        // handle it.
        if (recenterRequested) {
            setPosition(hookPos.coords);
            setFollowing(true);
            if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                try {
                    mapRef.current.panTo(hookPos.coords);
                    setRecenterRequested(false);
                } catch (err) {
                    console.error('panTo failed', err);
                }
            }
            // otherwise keep recenterRequested true until map instance becomes available
        }
    }, [hookPos, following, recenterRequested]);

    // watch for the recenter flag plus map instance to appear or map becoming ready
    useEffect(() => {
        if (recenterRequested && hookPos && mapReady && mapRef.current && typeof mapRef.current.panTo === 'function') {
            console.log('effect: pan because mapReady and recenterRequested');
            try {
                mapRef.current.panTo(hookPos);
            } catch (e) {
                console.error('panTo failed in readiness effect', e);
            }
            setRecenterRequested(false);
        }
    }, [recenterRequested, hookPos, mapReady]);

    if (!components || !position) {
        if (hookPos && !position) setPosition(hookPos.coords);
        return <div className="h-full w-full flex items-center justify-center"><LoadingAnimation /></div>;
    }

    const { MapContainer, TileLayer, Marker, Pane, useMap } = components as any;

    // child component used inside MapContainer for pan logic
    const RecenterHelper = ({ target, request, onPanned }: { target: [number, number] | null; request: boolean; onPanned?: () => void }) => {
        const map = useMap();
        useEffect(() => {
            if (request && target && map && typeof map.panTo === 'function') {
                // RecenterHelper panning
                try {
                    map.panTo(target);
                    if (onPanned) onPanned();
                } catch (err) { console.error('panTo failed in RecenterHelper', err); }
            }
        }, [request, target, map]);
        return null;
    };

    return (
        <div className="h-full w-full">
            <MapContainer
                whenCreated={(map: any) => {
                    mapRef.current = map;
                    setMapReady(true);
                    if (recenterRequested && hookPos && mapRef.current && typeof mapRef.current.panTo === 'function') {
                        try { mapRef.current.panTo(hookPos.coords); } catch (err) { console.error('panTo failed on map creation', err); }
                        setRecenterRequested(false);
                    }
                }}
                center={position}
                zoom={18}
                scrollWheelZoom={true}
                zoomControl={false}
                className="h-full w-full"
            >
                <RecenterHelper
                    target={hookPos?.coords ?? null}
                    request={recenterRequested}
                    onPanned={() => setRecenterRequested(false)}
                />
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
                        }}
                    />
                )}

                {!following && (
                    <div className="absolute top-2 right-2 z-500">
                        <button
                            className="bg-white text-sm text-black p-2 rounded-full shadow cursor-pointer"
                            onClick={() => {
                                setFollowing(true);
                                if (hookPos) {
                                    const coords = hookPos.coords;
                                    setPosition(coords);
                                    if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                                        mapRef.current.panTo(coords);
                                    }
                                }
                            }}
                        >
                            <Image src={targetIcon} alt="Recenter" width={20} height={20} />
                        </button>
                    </div>
                )}

                {/* Persistent current-location button for New Case */}
                <div className="absolute bottom-4 right-4 z-600">
                    <button
                        title="Center on current location"
                        type="button"
                        className="bg-white p-2 rounded-full shadow hover:shadow-md focus:outline-none cursor-pointer"
                        onClick={() => {
                            if (hookPos) {
                                const coords = hookPos.coords;
                                setPosition(coords);
                                setFollowing(true);
                                if (mapRef.current && typeof mapRef.current.panTo === 'function') {
                                    try { mapRef.current.panTo(coords); } catch (err) { console.error('panTo failed', err); }
                                } else {
                                    setRecenterRequested(true);
                                }
                            } else {
                                setRecenterRequested(true);
                                try { requestLocation(); } catch (e) { console.error('requestLocation failed', e); }
                            }
                        }}
                    >
                        <Image src={targetIcon} alt="Current" width={24} height={24} />
                    </button>
                </div>

            </MapContainer>
        </div>
    );
}
