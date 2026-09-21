import { cn } from "../../lib/utils";

export function PageShell({ children, className }) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}

export function Section({ children, className }) {
  return <section className={cn("space-y-4", className)}>{children}</section>;
}

export function Panel({ children, className }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 shadow-[0_8px_28px_rgba(18,18,20,0.05)]", className)}>
      {children}
    </div>
  );
}

export function Stack({ children, className }) {
  return <div className={cn("flex flex-col gap-4", className)}>{children}</div>;
}

export function Cluster({ children, className }) {
  return <div className={cn("flex flex-wrap items-center gap-3", className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
