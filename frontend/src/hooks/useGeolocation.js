import { useState, useCallback } from 'react';

const useGeolocation = () => {
    const [coords, setCoords] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }
        setLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
                setLoading(false);
            },
            (err) => {
                let msg = 'Unable to retrieve your location.';
                if (err.code === 1) msg = 'Location access denied. Please allow location in browser settings.';
                else if (err.code === 2) msg = 'Location unavailable. Please try again.';
                else if (err.code === 3) msg = 'Location request timed out.';
                setError(msg);
                setLoading(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    }, []);

    const clearLocation = useCallback(() => {
        setCoords(null);
        setError(null);
    }, []);

    return { coords, loading, error, getLocation, clearLocation };
};

export default useGeolocation;
