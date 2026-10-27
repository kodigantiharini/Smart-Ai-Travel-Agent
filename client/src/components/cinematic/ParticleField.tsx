import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  alpha: number;
  pulseSpeed: number;
  color: string;
}

export const ParticleField: React.FC<{ count?: number; className?: string }> = ({
  count = 90,
  className = 'absolute inset-0 pointer-events-none',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const colors = [
      'rgba(255, 255, 255, ',
      'rgba(45, 212, 191, ', // Cyan teal
      'rgba(245, 158, 11, ', // Warm gold
      'rgba(168, 85, 247, ', // Subtle violet
    ];

    const particles: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.2 + 0.6,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: -Math.random() * 0.35 - 0.05,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.008,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.alpha += p.pulseSpeed;
        if (p.alpha > 0.85 || p.alpha < 0.15) {
          p.pulseSpeed = -p.pulseSpeed;
        }

        if (!shouldReduceMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < 0) p.y = height;
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
        ctx.shadowBlur = p.size * 3.5;
        ctx.shadowColor = p.color === colors[1] ? '#14B8A6' : '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [count, shouldReduceMotion]);

  return <canvas ref={canvasRef} className={className} />;
};
