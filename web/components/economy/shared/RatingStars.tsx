'use client';

import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function RatingStars({ rating, maxRating = 5, size = 'md', showValue = true }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const fullStars = Math.floor(rating);
  const partialFill = rating - fullStars;

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: maxRating }, (_, i) => {
          const isFull = i < fullStars;
          const isPartial = i === fullStars && partialFill > 0;

          return (
            <div key={i} className="relative">
              <Star
                className={`${starSize} ${isFull || isPartial ? 'text-amber-400' : 'text-gray-600'}`}
                fill={isFull ? 'currentColor' : 'none'}
              />
              {isPartial && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${partialFill * 100}%` }}
                >
                  <Star className={`${starSize} text-amber-400`} fill="currentColor" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={`font-mono font-bold text-[var(--theme-text)] ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
