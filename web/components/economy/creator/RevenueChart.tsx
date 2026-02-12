'use client';

import { useMemo } from 'react';
import { EarningsDataPoint } from '@/types/economy';

interface RevenueChartProps {
  data: EarningsDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const points = useMemo(() => {
    const max = Math.max(...data.map((d) => d.earnings), 1);
    const width = 100;
    const height = 60;
    const padding = 4;

    return data.map((d, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (d.earnings / max) * (height - padding * 2);
      return { x, y, value: d.earnings, date: d.date };
    });
  }, [data]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      return `${acc} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${pathD} L ${last.x} 60 L ${first.x} 60 Z`;
  }, [pathD, points]);

  return (
    <div className="relative w-full h-20">
      <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 1, 2, 3].map((i) => (
          <line
            key={i}
            x1="0"
            y1={15 * i + 4}
            x2="100"
            y2={15 * i + 4}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="0.5"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#gradient)" opacity="0.3" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#FF0420"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF0420" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#FF0420" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Labels */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[8px] text-[var(--theme-text-muted)]">
        <span>{data[0]?.date.slice(5)}</span>
        <span>{data[data.length - 1]?.date.slice(5)}</span>
      </div>
    </div>
  );
}
