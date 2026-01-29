import * as React from 'react';

export function Card({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        `rounded-2xl border border-white/10 bg-white/[0.03] ` +
        `shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl ${className}`
      }
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-5">
      <div>
        <div className="text-sm font-semibold tracking-tight text-white">{title}</div>
        {subtitle ? <div className="mt-1 text-xs text-zinc-400">{subtitle}</div> : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

export function CardBody({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`px-5 pb-5 ${className}`} {...props} />;
}
