// v285: explicit CORS for WKWebView cross-origin fetch.
import { NextRequest } from 'next/server';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');

  if (!zip || !/^\d{5}$/.test(zip)) {
    return Response.json({ error: 'Invalid ZIP code' }, { status: 400, headers: CORS });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return Response.json({ error: 'ZIP code not found' }, { status: 404, headers: CORS });
    }

    const data = await res.json();
    const place = data.places?.[0];

    if (!place) {
      return Response.json({ error: 'No location data for this ZIP' }, { status: 404, headers: CORS });
    }

    const lat = place.latitude as string | undefined;
    const lon = place.longitude as string | undefined;

    let county: string | null = null;

    if (lat && lon) {
      try {
        const nomRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`,
          { headers: { 'User-Agent': 'RegPulse/1.0 (atestani56@gmail.com)', 'Accept-Language': 'en' } }
        );
        if (nomRes.ok) {
          const nomData = await nomRes.json() as { address?: { county?: string; state_district?: string } };
          const raw = nomData.address?.county ?? nomData.address?.state_district ?? null;
          // Strip common suffixes like " County", " Parish", " Borough", " Census Area"
          county = raw ? raw.replace(/\s+(County|Parish|Borough|Census Area|Municipality)$/i, '').trim() : null;
        }
      } catch {
        // County is optional — silently skip on Nominatim failure
      }
    }

    return Response.json({
      city: place['place name'],
      state: place['state'],
      stateAbbr: place['state abbreviation'],
      county,
      zip,
      formatted: `${place['place name']}, ${place['state abbreviation']} ${zip}`,
    }, { headers: CORS });
  } catch {
    return Response.json({ error: 'Failed to look up ZIP code' }, { status: 500, headers: CORS });
  }
}
