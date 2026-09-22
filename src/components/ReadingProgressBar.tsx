'use client';

import { useEffect, useState } from 'react';

export default function ReadingProgressBar() {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const updateScrollCompletion = () => {
      const currentProgress = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        setCompletion(Math.min(100, Math.max(0, (currentProgress / scrollHeight) * 100)));
      }
    };

    window.addEventListener('scroll', updateScrollCompletion, { passive: true });
    updateScrollCompletion();

    return () => {
      window.removeEventListener('scroll', updateScrollCompletion);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-100/40 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-accent-500 via-accent-600 to-accent-500 transition-all duration-100 ease-out shadow-[0_0_8px_rgba(234,88,12,0.6)]"
        style={{ width: `${completion}%` }}
        role="progressbar"
        aria-valuenow={completion}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progreso de lectura"
      />
    </div>
  );
}
