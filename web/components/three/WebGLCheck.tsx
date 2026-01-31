'use client';

import { useEffect, useState } from 'react';

export function WebGLCheck({ children }: { children: React.ReactNode }) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      setHasWebGL(!!gl);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black text-white p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">WebGL Not Supported</h2>
          <p>Your browser does not support WebGL, which is required for 3D visualizations.</p>
          <p className="mt-2 text-sm text-gray-400">Please use a modern browser like Chrome, Firefox, or Safari.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
