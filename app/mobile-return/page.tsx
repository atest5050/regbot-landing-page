'use client';

import { useEffect } from 'react';

export default function MobileReturnPage() {
  useEffect(() => {
    // Redirect to the app's deep link — iOS will open RegPulse and fire appUrlOpen.
    window.location.href = 'regpulse://chat/?success=true';
  }, []);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif',
      background: '#0b1830', color: '#fff', gap: 16, padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 48 }}>✓</div>
      <p style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Payment confirmed!</p>
      <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Returning you to RegPulse...</p>
      <a
        href="regpulse://chat/?success=true"
        style={{
          marginTop: 8, padding: '12px 28px', background: '#22d3ee', color: '#0b1830',
          borderRadius: 12, fontWeight: 700, textDecoration: 'none', fontSize: 16,
        }}
      >
        Open RegPulse
      </a>
    </div>
  );
}
