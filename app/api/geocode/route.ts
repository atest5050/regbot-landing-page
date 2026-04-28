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

    return Response.json({
      city: place['place name'],
      state: place['state'],
      stateAbbr: place['state abbreviation'],
      zip,
      formatted: `${place['place name']}, ${place['state abbreviation']} ${zip}`,
    }, { headers: CORS });
  } catch {
    return Response.json({ error: 'Failed to look up ZIP code' }, { status: 500, headers: CORS });
  }
}
