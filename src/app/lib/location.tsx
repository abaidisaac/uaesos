import { useCallback, useEffect, useRef, useState } from "react";

type Loc = { coords: [number, number]; heading?: number } | null;
type State = "prompt" | "granted" | "denied" | "acquiring" | "unsupported" | "error";

export function useGeolocationWithStatus(options?: {
    autoRequest?: boolean;
    autoWatch?: boolean;
    watchOptions?: PositionOptions;
}) {
    const { autoRequest = true, autoWatch = false, watchOptions } = options || {};
    const [position, setPosition] = useState<Loc>(null);
    const [status, setStatus] = useState<State>("prompt");
    const [locationError, setLocationError] = useState<string | null>(null);

    const watcherRef = useRef<number | null>(null);
    const mountedRef = useRef(true);
    // Ref keeps startWatch's identity stable across inline options objects.
    const watchOptionsRef = useRef(watchOptions);
    useEffect(() => {
        watchOptionsRef.current = watchOptions;
    }, [watchOptions]);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (watcherRef.current !== null && "geolocation" in navigator) {
                navigator.geolocation.clearWatch(watcherRef.current);
                watcherRef.current = null;
            }
        };
    }, []);

    // `navigator` doesn't exist during SSR, so this is detected on the client after mount.
    useEffect(() => {
        if (!("geolocation" in navigator)) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStatus("unsupported");
            setLocationError("Geolocation not supported by this browser.");
            return;
        }
        if (!("permissions" in navigator)) {
            setStatus("prompt");
            return;
        }

        let cancelled = false;
        let permissionStatus: PermissionStatus | null = null;
        const handleChange = () => {
            if (!mountedRef.current || !permissionStatus) return;
            setStatus(permissionStatus.state as State);
        };

        navigator.permissions
            .query({ name: "geolocation" as PermissionName })
            .then((ps) => {
                if (cancelled || !mountedRef.current) return;
                permissionStatus = ps;
                setStatus(ps.state as State);
                ps.addEventListener("change", handleChange);
            })
            .catch(() => {
                setStatus("prompt");
            });

        return () => {
            cancelled = true;
            permissionStatus?.removeEventListener("change", handleChange);
        };
    }, []);

    const stopWatch = useCallback(() => {
        if (watcherRef.current !== null && "geolocation" in navigator) {
            try {
                navigator.geolocation.clearWatch(watcherRef.current);
            } catch { }
            watcherRef.current = null;
        }
    }, []);

    const startWatch = useCallback((opts?: PositionOptions) => {
        if (!("geolocation" in navigator)) {
            setStatus("unsupported");
            setLocationError("Geolocation not supported.");
            return;
        }

        stopWatch();

        try {
            watcherRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    if (!mountedRef.current) return;
                    const heading = pos.coords.heading ?? undefined;
                    setPosition((prev) =>
                        prev &&
                            prev.coords[0] === pos.coords.latitude &&
                            prev.coords[1] === pos.coords.longitude &&
                            prev.heading === heading
                            ? prev
                            : { coords: [pos.coords.latitude, pos.coords.longitude], heading }
                    );
                    setStatus("granted");
                },
                (err) => {
                    if (!mountedRef.current) return;
                    if (err.code === err.PERMISSION_DENIED) {
                        setStatus("denied");
                        setLocationError("Permission denied. Please enable location in your browser.");
                    } else if (err.code === err.TIMEOUT) {
                        setStatus("error");
                        setLocationError("Location request timed out. Try again.");
                    } else {
                        setStatus("error");
                        setLocationError(err.message || "Failed to get location.");
                    }
                },
                { enableHighAccuracy: true, timeout: 8000, ...(opts || watchOptionsRef.current || {}) }
            );
        } catch {
            setStatus("error");
            setLocationError("Unable to start location watch.");
        }
    }, [stopWatch]);

    const requestLocation = useCallback((opts?: PositionOptions) => {
        if (!("geolocation" in navigator)) {
            setStatus("unsupported");
            setLocationError("Geolocation not supported.");
            return;
        }

        setStatus("acquiring");
        setLocationError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (!mountedRef.current) return;
                setPosition({ coords: [pos.coords.latitude, pos.coords.longitude], heading: pos.coords.heading ?? undefined });
                setStatus("granted");
            },
            (err) => {
                if (!mountedRef.current) return;
                if (err.code === err.PERMISSION_DENIED) {
                    setStatus("denied");
                    setLocationError("Permission denied. Please enable location in your browser.");
                } else if (err.code === err.TIMEOUT) {
                    setStatus("error");
                    setLocationError("Location request timed out. Try again.");
                } else {
                    setStatus("error");
                    setLocationError(err.message || "Failed to get location.");
                }
            },
            { enableHighAccuracy: true, timeout: 8000, ...(opts || {}) }
        );
    }, []);

    useEffect(() => {
        if (autoWatch) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            startWatch();
        } else if (autoRequest) {
            requestLocation();
        }
        return () => {
            stopWatch();
        };
    }, [autoRequest, autoWatch, requestLocation, startWatch, stopWatch]);

    return {
        position,
        status,
        locationError,
        requestLocation,
        startWatch,
        stopWatch,
    };
}

