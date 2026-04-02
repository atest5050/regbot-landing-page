import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get('zip');

  if (!zip || !/^\d{5}$/.test(zip)) {
    return Response.json({ error: 'Invalid ZIP code' }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.zippopotam.us/us/${zip}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return Response.json({ error: 'ZIP code not found' }, { status: 404 });
    }

    const data = await res.json();
    const place = data.places?.[0];

    if (!place) {
      return Response.json({ error: 'No location data for this ZIP' }, { status: 404 });
    }

    return Response.json({
      city: place['place name'],
      state: place['state'],
      stateAbbr: place['state abbreviation'],
      zip,
      formatted: `${place['place name']}, ${place['state abbreviation']} ${zip}`,
    });
  } catch {
    return Response.json({ error: 'Failed to look up ZIP code' }, { status: 500 });
  }
}
