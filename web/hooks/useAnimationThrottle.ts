'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook to conditionally disable 3D animations in dev mode for performance.
 * 
 * Checks NEXT_PUBLIC_DISABLE_3D_ANIMATIONS env var:
 * - If set to 'true', returns true (animations disabled)
 * - Otherwise returns false (animations enabled, production default)
 * 
 * Usage:
 * const isAnimationDisabled = useAnimationThrottle();
 * 
 * if (isAnimationDisabled) {
 *   // Skip useFrame or render static geometry
 *   return <staticGeometry />;
 * }
 * 
 * // Normal animated rendering
 * useFrame((state) => { ... });
 */
export function useAnimationThrottle(): boolean {
  const isDisabledRef = useRef<boolean | null>(null);

  useEffect(() => {
    // Only check on client side
    if (typeof window !== 'undefined') {
      const envValue = process.env.NEXT_PUBLIC_DISABLE_3D_ANIMATIONS;
      isDisabledRef.current = envValue === 'true';
    }
  }, []);

  return isDisabledRef.current ?? false;
}
