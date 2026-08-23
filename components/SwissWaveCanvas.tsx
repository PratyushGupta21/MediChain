'use client';

import React, { useEffect, useRef } from 'react';

export default function SwissWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let step = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      step += 0.008;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // High-Contrast Light Mode Grid Lines (Dark Charcoal / Black lines)
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.06)';
      ctx.lineWidth = 1;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // High-Precision Black Contour Line Art Ribbon
      const ribbons = 12;
      const points = 100;

      for (let r = 0; r < ribbons; r++) {
        ctx.beginPath();
        const rOffset = (r / ribbons) * Math.PI * 2;
        const opacity = 0.04 + (1 - r / ribbons) * 0.10;
        ctx.strokeStyle = `rgba(15, 23, 42, ${opacity})`;
        ctx.lineWidth = 1.2;

        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = t * width;
          const baseY = height * 0.5;

          const wave1 = Math.sin(t * Math.PI * 3 + step + rOffset) * 120;
          const wave2 = Math.cos(t * Math.PI * 2 - step * 0.7 + r * 0.2) * 80;
          const wave3 = Math.sin((t + r * 0.05) * Math.PI * 5 + step * 1.2) * 40;

          const y = baseY + wave1 + wave2 + wave3 + (r - ribbons / 2) * 24;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none opacity-90"
      />
    </div>
  );
}
