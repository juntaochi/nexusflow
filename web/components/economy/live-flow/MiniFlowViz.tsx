'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
}

export function MiniFlowViz() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    let id = 0;
    const interval = setInterval(() => {
      const newParticle: Particle = {
        id: id++,
        startX: Math.random() * 100,
        startY: Math.random() * 100,
        endX: Math.random() * 100,
        endY: Math.random() * 100,
        duration: 1 + Math.random() * 2,
      };

      setParticles((prev) => [...prev.slice(-10), newParticle]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-32 rounded-xl bg-black/30 border border-[var(--theme-border)] overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,4,32,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,4,32,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
      />

      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            left: `${particle.startX}%`,
            top: `${particle.startY}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            left: `${particle.endX}%`,
            top: `${particle.endY}%`,
            opacity: [0, 1, 1, 0],
            scale: [0, 1, 1, 0],
          }}
          transition={{
            duration: particle.duration,
            ease: 'easeInOut',
          }}
          className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="w-full h-full rounded-full bg-primary shadow-[0_0_10px_rgba(255,4,32,0.8)]" />
        </motion.div>
      ))}

      {/* Static nodes */}
      {[
        { x: 20, y: 30 },
        { x: 50, y: 50 },
        { x: 80, y: 25 },
        { x: 35, y: 75 },
        { x: 70, y: 70 },
      ].map((node, i) => (
        <div
          key={i}
          className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 border border-primary/50"
          style={{ left: `${node.x}%`, top: `${node.y}%` }}
        >
          <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
        </div>
      ))}

      {/* Label */}
      <div className="absolute bottom-2 left-2 text-[8px] font-bold uppercase tracking-widest text-primary/60">
        Live Flow
      </div>
    </div>
  );
}
