import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

/** Pune fallback when location permission is denied (matches web dev default). */
const DEFAULT_LAT = 18.4562;
const DEFAULT_LNG = 73.9095;

export function useDeviceLocation() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (!cancelled) {
            setPermissionDenied(true);
            setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          }
          return;
        }
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        }
      } catch {
        if (!cancelled) {
          setPermissionDenied(true);
          setCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        }
      }
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, []);

  return { coords, permissionDenied };
}
