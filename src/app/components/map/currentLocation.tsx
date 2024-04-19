"use client";
import mapboxgl, { LngLatLike, Marker } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

export default function CurrentLocationMap(props: { location: LngLatLike; setLocation: any }) {
    const mapContainer = useRef(null);
    const map = useRef<any>();
    const marker = useRef<Marker>();

    mapboxgl.accessToken =
        "pk.eyJ1IjoiYWJhaWRpc2FhYyIsImEiOiJjbHY1cGFwNXAwNjAwMmlvYnhiZmFiM3JuIn0.Lb0hlrDM8faU_C8piEceFA";

    useEffect(() => {
        if (!map.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current!,
                style: "mapbox://styles/mapbox/streets-v12",
                attributionControl: false,
                center: props.location,
                minZoom: 12,
            });
            marker.current = new mapboxgl.Marker({ draggable: true }).setLngLat(props.location).addTo(map.current!);
        }
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
