"use client";

import { useEffect, useState } from "react";

export function ReadingProgressBar({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    function update() {
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(100);
        return;
      }
      const scrolled = Math.min(Math.max(-rect.top, 0), total);
      setProgress(Math.round((scrolled / total) * 100));
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [targetId]);

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-white/5"
    >
      <div
        className="h-full bg-amber-400 transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
