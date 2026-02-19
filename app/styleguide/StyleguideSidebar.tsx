"use client";

import { NAV_SECTIONS } from "./navigation";

export function StyleguideSidebar() {
  return (
    <aside className="w-52 shrink-0">
      <div className="sticky top-8">
        <p className="text-section-label text-muted mb-4 tracking-widest uppercase">Sections</p>
        <nav className="flex flex-col gap-1">
          {NAV_SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded-interactive text-sm text-body hover:text-heading hover:bg-noir-active transition-colors"
            >
              <span className="font-mono-nums text-muted text-xs w-5 shrink-0">
                {section.number}
              </span>
              <span>{section.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
