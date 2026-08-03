import { useEffect, useRef, useState } from 'react';
import { Box, Link, Typography } from '@mui/material';
import type { PublicBranch } from '@/features/public/api/publicProfileApi';

const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

interface BranchLocationsMapProps {
  branches: PublicBranch[];
  height?: number;
}

function buildGoogleMapsSearchUrl(branch: PublicBranch): string {
  const query = encodeURIComponent(
    `${branch.addressLine1}, ${branch.city}, ${branch.state} ${branch.pincode}`,
  );
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function buildOsmEmbedUrl(branches: PublicBranch[]): string {
  const primary = branches.find((b) => b.primary) ?? branches[0];
  const lat = primary.latitude;
  const lng = primary.longitude;
  const delta = 0.02;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
}

export function BranchLocationsMap({ branches, height = 320 }: BranchLocationsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapsApiKey || branches.length === 0 || !mapRef.current) {
      return;
    }

    let cancelled = false;

    const loadMap = async () => {
      try {
        const google = await loadGoogleMapsScript(mapsApiKey);
        if (cancelled || !mapRef.current) return;

        const primary = branches.find((b) => b.primary) ?? branches[0];
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: Number(primary.latitude), lng: Number(primary.longitude) },
          zoom: branches.length === 1 ? 14 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        const bounds = new google.maps.LatLngBounds();
        branches.forEach((branch) => {
          const position = { lat: Number(branch.latitude), lng: Number(branch.longitude) };
          bounds.extend(position);
          new google.maps.Marker({
            map,
            position,
            title: branch.name,
          });
        });

        if (branches.length > 1) {
          map.fitBounds(bounds, 48);
        }
      } catch {
        if (!cancelled) setMapError(true);
      }
    };

    void loadMap();
    return () => {
      cancelled = true;
    };
  }, [branches, mapsApiKey]);

  if (branches.length === 0) {
    return (
      <Typography color="text.secondary">No branch locations available.</Typography>
    );
  }

  if (mapsApiKey && !mapError) {
    return (
      <Box>
        <Box ref={mapRef} sx={{ width: '100%', height, borderRadius: 2, bgcolor: 'grey.100' }} />
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {branches.map((branch) => (
            <Link key={branch.id} href={buildGoogleMapsSearchUrl(branch)} target="_blank" rel="noopener noreferrer">
              Open {branch.name} in Google Maps
            </Link>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        component="iframe"
        title="Hospital branch locations"
        src={buildOsmEmbedUrl(branches)}
        sx={{ width: '100%', height, border: 0, borderRadius: 2 }}
      />
      <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {branches.map((branch) => (
          <Link key={branch.id} href={buildGoogleMapsSearchUrl(branch)} target="_blank" rel="noopener noreferrer">
            Open {branch.name} in Google Maps
          </Link>
        ))}
      </Box>
      {!mapsApiKey ? (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Set VITE_GOOGLE_MAPS_API_KEY for interactive Google Maps markers.
        </Typography>
      ) : null}
    </Box>
  );
}

function loadGoogleMapsScript(apiKey: string): Promise<GoogleMapsNamespace> {
  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('google-maps-script');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () => reject(new Error('Google Maps failed to load')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });
}

interface GoogleMapsNamespace {
  maps: {
    Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
    Marker: new (options: Record<string, unknown>) => void;
    LatLngBounds: new () => GoogleLatLngBounds;
  };
}

interface GoogleMapInstance {
  fitBounds: (bounds: GoogleLatLngBounds, padding?: number) => void;
}

interface GoogleLatLngBounds {
  extend: (position: { lat: number; lng: number }) => void;
}

declare global {
  interface Window {
    google: GoogleMapsNamespace;
  }
}
