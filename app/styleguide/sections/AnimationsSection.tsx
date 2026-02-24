"use client";

import { useState } from "react";

interface AnimDemoProps {
  name: string;
  className: string;
  tailwind: string;
  desc: string;
}

function AnimDemo({ name, className, tailwind, desc }: AnimDemoProps) {
  const [key, setKey] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="h-20 w-full rounded-card bg-noir-active border border-noir-border flex items-center justify-center overflow-hidden">
        <div key={key} className={`w-10 h-10 rounded-interactive bg-accent-primary ${className}`} />
      </div>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-heading">{name}</p>
          <p className="font-mono-nums text-xs text-muted">{tailwind}</p>
          <p className="text-xs text-muted mt-0.5">{desc}</p>
        </div>
        <button
          type="button"
          onClick={() => setKey((k) => k + 1)}
          className="shrink-0 text-xs text-accent-primary hover:text-accent-primary-light transition-colors px-2 py-1 rounded-interactive border border-noir-border"
        >
          Replay
        </button>
      </div>
    </div>
  );
}

export function AnimationsSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        <AnimDemo
          name="slide-up"
          className="animate-slide-up"
          tailwind="animate-slide-up"
          desc="0.6s cubic-bezier(0.22, 1, 0.36, 1)"
        />
        <AnimDemo
          name="fade-in"
          className="animate-fade-in"
          tailwind="animate-fade-in"
          desc="0.5s ease-out"
        />
        <AnimDemo
          name="scale-in"
          className="animate-scale-in"
          tailwind="animate-scale-in"
          desc="0.4s cubic-bezier(0.22, 1, 0.36, 1)"
        />
        <AnimDemo
          name="glow-pulse"
          className="animate-glow-pulse"
          tailwind="animate-glow-pulse"
          desc="2s ease-in-out infinite"
        />
      </div>

      <div>
        <h3 className="text-section-title text-heading mb-3">Stagger Delays</h3>
        <p className="text-sm text-muted mb-4">
          Apply to children along with an animation class to cascade entrances.
        </p>
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className={`w-10 h-10 rounded-interactive bg-accent-primary/30 border border-accent-primary/40 flex items-center justify-center animate-fade-in stagger-${n}`}
            >
              <span className="font-mono-nums text-xs text-accent-primary">{n}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
