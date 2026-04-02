import { useState, useEffect, useRef } from 'react';

export interface LocationState {
  userLocation: string;
  useExactLocation: boolean;
  setUseExactLocation: (v: boolean) => void;
}

// ── GPS / manual location detection, extracted from ChatPage ─────────────────
//
// When useExactLocation is true: fetches GPS coords then reverse-geocodes via
// Nominatim. gpsActiveRef prevents a stale Nominatim response from overwriting
// the location if the user toggles to manual mode before the fetch resolves.

export function useLocation(): LocationState {
  const [userLocation, setUserLocation]           = useState('Detecting your location...');
  const [useExactLocation, setUseExactLocationState] = useState(true);
  const gpsActiveRef = useRef(true);

  useEffect(() => {
    if (useExactLocation) {
      gpsActiveRef.current = true;
      navigator.geolocation?.getCurrentPosition(
        async (pos) => {
          if (!gpsActiveRef.current) return;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json` +
              `&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=18&addressdetails=1`
            );
            const data = await res.json();
            if (!gpsActiveRef.current) return;
            const city  = data.address?.city || data.address?.town || data.address?.village || 'Unknown City';
            const state = data.address?.state || 'Unknown State';
            const zip   = data.address?.postcode || '';
            setUserLocation(zip ? `${city}, ${state} ${zip}` : `${city}, ${state}`);
          } catch {
            if (gpsActiveRef.current) setUserLocation('Your current location');
          }
        },
        () => { if (gpsActiveRef.current) setUserLocation('Your current location'); },
      );
    } else {
      gpsActiveRef.current = false;
    }
  }, [useExactLocation]);

  // Immediately cancel GPS on toggle so stale Nominatim responses are dropped
  const setUseExactLocation = (v: boolean) => {
    if (!v) gpsActiveRef.current = false;
    setUseExactLocationState(v);
  };

  return { userLocation, useExactLocation, setUseExactLocation };
}
