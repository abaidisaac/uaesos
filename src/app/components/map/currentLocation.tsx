"use client";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

export default function CurrentLocationMap(props: { location: LngLatLike; setLocation: any }) {
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.Map>();
    const marker = useRef<Marker>();

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX!;

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: "mapbox://styles/mapbox/streets-v12",
                attributionControl: false,
                center: props.location,
                minZoom: 12,
            });
        }
        marker.current?.remove();
        map.current.setCenter(props.location)
        marker.current = new mapboxgl.Marker({ draggable: true }).setLngLat(props.location).addTo(map.current!);
    });

    useEffect(() => {
        marker.current?.on("dragend", () => {
            props.setLocation({
                lng: Number(marker.current?.getLngLat().lng.toFixed(5)),
                lat: Number(marker.current?.getLngLat().lat.toFixed(5)),
            });
        });
    });

    return <div className="h-96 rounded-xl" ref={mapContainer}></div>;
}
