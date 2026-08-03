import { useCallback, useEffect, useState } from 'react';
import { detectUserLocation, type UserCoordinates } from '../api/locationApi';

export function useUserLocation(autoDetect = false) {
  const [coords, setCoords] = useState<UserCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const location = await detectUserLocation();
      setCoords(location);
      return location;
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unable to detect location.';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoDetect) {
      void detect();
    }
  }, [autoDetect, detect]);

  return { coords, loading, error, detect };
}
