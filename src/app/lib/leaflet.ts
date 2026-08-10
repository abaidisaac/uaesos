import { useEffect, useState } from "react";
import type * as LeafletNamespace from "leaflet";
import type * as ReactLeafletNamespace from "react-leaflet";
import type { StaticImageData } from "next/image";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export async function loadLeafletModules(): Promise<{ L: typeof LeafletNamespace; RLModule: typeof ReactLeafletNamespace }> {
    const [LModule, RLModule] = await Promise.all([import("leaflet"), import("react-leaflet")]);
    const L = (LModule && (LModule as unknown as { default?: typeof LeafletNamespace }).default) || LModule;

    return { L, RLModule };
}

// Marker images resolve to either a StaticImageData object or a plain string, depending on loader.
export function imageSrc(i: StaticImageData | string): string {
    return typeof i === "string" ? i : i.src;
}

let iconsMerged = false;

export type UseLeafletResult = {
    L: typeof LeafletNamespace;
    RL: typeof ReactLeafletNamespace;
} | null;

// leaflet touches `window` at import time, so it's loaded dynamically here instead of statically.
export function useLeaflet(): { leaflet: UseLeafletResult; error: string | null } {
    const [leaflet, setLeaflet] = useState<UseLeafletResult>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                const { L, RLModule } = await loadLeafletModules();

                if (!iconsMerged && L?.Icon?.Default && typeof L.Icon.Default.mergeOptions === "function") {
                    L.Icon.Default.mergeOptions({
                        iconUrl: imageSrc(markerIcon),
                        iconRetinaUrl: imageSrc(markerIcon2x),
                        shadowUrl: imageSrc(markerShadow),
                    });
                    iconsMerged = true;
                }

                if (!mounted) return;
                setLeaflet({ L, RL: RLModule });
            } catch (err) {
                console.error("Failed to load leaflet/react-leaflet:", err);
                if (!mounted) return;
                setError(err instanceof Error ? err.message : "Failed to load leaflet/react-leaflet.");
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    return { leaflet, error };
}
