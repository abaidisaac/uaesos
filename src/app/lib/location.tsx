import { useCallback, useEffect, useRef, useState } from "react";

type Loc = [number, number] | null;
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
    const [isWatching, setIsWatching] = useState(false);

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

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setStatus("unsupported");
            setLocationError("Geolocation not supported by this browser.");
            return;
        }
        if (!("permissions" in navigator)) {
            setStatus("prompt");
            return;
        }

        let cancelled = false;
        navigator.permissions
            .query({ name: "geolocation" as PermissionName })
            .then((ps) => {
                if (cancelled || !mountedRef.current) return;
                setStatus(ps.state as State);
                if (typeof ps.onchange === "function") {
                    ps.onchange = () => {
                        if (!mountedRef.current) return;
                        setStatus(ps.state as State);
                    };
                }
            })
            .catch(() => {
                setStatus("prompt");
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const stopWatch = useCallback(() => {
        if (watcherRef.current !== null && "geolocation" in navigator) {
            try {
                navigator.geolocation.clearWatch(watcherRef.current);
            } catch (e) {
                // ignore
            }
            watcherRef.current = null;
            setIsWatching(false);
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
                    setPosition([pos.coords.latitude, pos.coords.longitude]);
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
                { enableHighAccuracy: true, timeout: 8000, ...(opts || watchOptions || {}) }
            );
            setIsWatching(true);
        } catch (e) {
            setStatus("error");
            setLocationError("Unable to start location watch.");
        }
    }, [stopWatch, watchOptions]);

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
                setPosition([pos.coords.latitude, pos.coords.longitude]);
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
        if (autoRequest) {
            requestLocation();
        }
        if (autoWatch) {
            startWatch();
        }
        return () => {
            stopWatch();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        position,
        status,
        locationError,
        requestLocation,
        startWatch,
        stopWatch,
        isWatching,
    };
}

export function useCurrentLocation() {
    const { position } = useGeolocationWithStatus();
    return position;
}

