interface SectionShellProps {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

export function SectionShell({ id, number, title, children }: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="flex items-baseline gap-3 mb-6 pb-3 border-b border-noir-border">
        <span className="text-section-label text-muted font-mono-nums">{number}</span>
        <h2 className="text-dashboard-subtitle text-heading">{title}</h2>
      </div>
      <div>{children}</div>
    </section>
  );
}
