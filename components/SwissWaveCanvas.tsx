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
      step += 0.006;
      const width = canvas.width;
      const height = canvas.height;

      const isDark =
        typeof document !== 'undefined' &&
        document.documentElement.classList.contains('dark');

      ctx.clearRect(0, 0, width, height);

      // 1. High-Contrast Technical Grid
      const gridSize = 60;
      ctx.lineWidth = 1;

      // Vertical & Horizontal Grid Lines
      ctx.strokeStyle = isDark
        ? 'rgba(248, 250, 252, 0.12)'
        : 'rgba(15, 23, 42, 0.12)';
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

      // Grid Intersection Crosshair Ticks
      ctx.strokeStyle = isDark
        ? 'rgba(52, 211, 153, 0.45)'
        : 'rgba(15, 23, 42, 0.22)';
      ctx.lineWidth = 1.2;
      const tickSize = 3;
      for (let x = gridSize; x < width; x += gridSize) {
        for (let y = gridSize; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x - tickSize, y);
          ctx.lineTo(x + tickSize, y);
          ctx.moveTo(x, y - tickSize);
          ctx.lineTo(x, y + tickSize);
          ctx.stroke();
        }
      }

      // 2. High-Precision Geometric Blueprint Arc Curves
      const arcCenterX = width * 0.85;
      const arcCenterY = height * 0.15;
      const radii = [180, 320, 480, 640, 800, 980, 1180];

      ctx.strokeStyle = isDark
        ? 'rgba(248, 250, 252, 0.15)'
        : 'rgba(15, 23, 42, 0.16)';
      ctx.lineWidth = 1.2;
      radii.forEach((r) => {
        ctx.beginPath();
        ctx.arc(arcCenterX, arcCenterY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Secondary Concentric Arcs (Bottom Left)
      const blCenterX = width * 0.05;
      const blCenterY = height * 0.95;
      const blRadii = [240, 420, 620, 840];
      ctx.strokeStyle = isDark
        ? 'rgba(52, 211, 153, 0.3)'
        : 'rgba(15, 23, 42, 0.14)';
      blRadii.forEach((r) => {
        ctx.beginPath();
        ctx.arc(blCenterX, blCenterY, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // 3. High-Contrast Contour Ribbon Curves
      const ribbons = 16;
      const points = 120;

      for (let r = 0; r < ribbons; r++) {
        ctx.beginPath();
        const rOffset = (r / ribbons) * Math.PI * 2;
        const opacity = 0.12 + (1 - r / ribbons) * 0.26;

        ctx.strokeStyle = isDark
          ? r % 3 === 0
            ? `rgba(52, 211, 153, ${opacity + 0.1})`
            : `rgba(248, 250, 252, ${opacity + 0.08})`
          : `rgba(15, 23, 42, ${opacity})`;
        ctx.lineWidth = 1.4;

        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const x = t * width;
          const baseY = height * 0.52;

          const wave1 = Math.sin(t * Math.PI * 3 + step + rOffset) * 130;
          const wave2 = Math.cos(t * Math.PI * 2 - step * 0.6 + r * 0.18) * 90;
          const wave3 = Math.sin((t + r * 0.04) * Math.PI * 4.5 + step * 1.1) * 45;

          const y = baseY + wave1 + wave2 + wave3 + (r - ribbons / 2) * 22;

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
    <div className="fixed inset-0 w-full h-full min-h-screen overflow-hidden pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none opacity-95"
      />
      {/* Semi-transparent dark/light overlay above canvas so background animation stays visible */}
      <div className="absolute inset-0 bg-white/80 dark:bg-slate-950/85 backdrop-blur-[1px] pointer-events-none transition-colors duration-200" />
    </div>
  );
}
