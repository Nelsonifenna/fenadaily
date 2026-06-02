"use client";

import { useEffect } from 'react';

export default function StudioPage() {
  useEffect(() => {
    // Redirect to WordPress admin
    window.location.href = 'https://fenadaily.com/wp-admin';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
      <p>Redirecting to WordPress...</p>
    </div>
  );
}
