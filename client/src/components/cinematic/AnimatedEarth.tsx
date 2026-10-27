import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

// Real world approximate coordinates for landmark nodes
const LANDMARK_NODES = [
  { name: 'Munnar', lat: 10.0889, lng: 77.0595, color: '#10B981' },
  { name: 'Paris', lat: 48.8566, lng: 2.3522, color: '#F59E0B' },
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503, color: '#2DD4BF' },
  { name: 'New York', lat: 40.7128, lng: -74.006, color: '#38BDF8' },
  { name: 'Bali', lat: -8.3405, lng: 115.092, color: '#EC4899' },
  { name: 'Dubai', lat: 25.2048, lng: 55.2708, color: '#EAB308' },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093, color: '#14B8A6' },
  { name: 'Rome', lat: 41.9028, lng: 12.4964, color: '#F97316' },
];

// Flight connection pairs
const FLIGHT_ROUTES = [
  [0, 1], // Munnar <-> Paris
  [1, 3], // Paris <-> New York
  [3, 2], // New York <-> Tokyo
  [2, 4], // Tokyo <-> Bali
  [4, 0], // Bali <-> Munnar
  [1, 5], // Paris <-> Dubai
  [5, 6], // Dubai <-> Sydney
];

export const AnimatedEarth: React.FC<{ size?: number; className?: string }> = ({
  size = 460,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotation = 0;
    const radius = size * 0.42;
    const cx = size / 2;
    const cy = size / 2;
    const tilt = (23.5 * Math.PI) / 180;

    // Convert (lat, lng) to 3D point on rotating sphere
    const project = (lat: number, lng: number, rot: number) => {
      const phi = (lat * Math.PI) / 180;
      const theta = ((lng + rot) * Math.PI) / 180;

      // 3D coordinates on sphere
      let x = radius * Math.cos(phi) * Math.sin(theta);
      let y = -radius * Math.sin(phi);
      let z = radius * Math.cos(phi) * Math.cos(theta);

      // Axial tilt rotation around X-axis
      const yt = y * Math.cos(tilt) - z * Math.sin(tilt);
      const zt = y * Math.sin(tilt) + z * Math.cos(tilt);

      return {
        x: cx + x,
        y: cy + yt,
        z: zt,
        visible: zt > -radius * 0.1, // Front-facing hemisphere test
      };
    };

    let pulse = 0;

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      if (!shouldReduceMotion) {
        rotation += 0.35;
      }
      pulse += 0.04;

      // 1. Deep Space Atmosphere Glow (Outer Halo)
      const outerGlow = ctx.createRadialGradient(cx, cy, radius * 0.85, cx, cy, radius * 1.35);
      outerGlow.addColorStop(0, 'rgba(13, 148, 136, 0.35)');
      outerGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.15)');
      outerGlow.addColorStop(1, 'rgba(15, 23, 42, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = outerGlow;
      ctx.fill();

      // 2. Planet Sphere Body Base
      const planetGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      planetGrad.addColorStop(0, '#0F2B48'); // Illuminated daytime ocean
      planetGrad.addColorStop(0.55, '#0A192F');
      planetGrad.addColorStop(0.88, '#040C1A'); // Shadowed limb
      planetGrad.addColorStop(1, '#020610');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = planetGrad;
      ctx.fill();

      // 3. Latitude & Longitude Graticule Lines (3D Rings)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(20, 184, 166, 0.12)';

      // Latitude circles
      [-60, -30, 0, 30, 60].forEach((lat) => {
        ctx.beginPath();
        let started = false;
        for (let lng = 0; lng <= 360; lng += 8) {
          const pt = project(lat, lng, rotation);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      });

      // Longitude meridians
      for (let lng = 0; lng < 360; lng += 30) {
        ctx.beginPath();
        let started = false;
        for (let lat = -80; lat <= 80; lat += 6) {
          const pt = project(lat, lng, rotation);
          if (pt.visible) {
            if (!started) {
              ctx.moveTo(pt.x, pt.y);
              started = true;
            } else {
              ctx.lineTo(pt.x, pt.y);
            }
          } else {
            started = false;
          }
        }
        ctx.stroke();
      }

      // 4. Continents & Island Clusters (Generative high-res landmasses)
      const landClusters = [
        { lat: 20, lng: 78, rad: 38 }, // India / Asia
        { lat: 48, lng: 15, rad: 34 }, // Europe
        { lat: 40, lng: -98, rad: 45 }, // North America
        { lat: -15, lng: -60, rad: 38 }, // South America
        { lat: 5, lng: 22, rad: 42 }, // Africa
        { lat: -25, lng: 135, rad: 30 }, // Australia
        { lat: 36, lng: 138, rad: 16 }, // Japan
        { lat: -5, lng: 115, rad: 20 }, // Indonesia / Bali
      ];

      landClusters.forEach((land) => {
        const center = project(land.lat, land.lng, rotation);
        if (center.visible) {
          const landGrad = ctx.createRadialGradient(
            center.x,
            center.y,
            1,
            center.x,
            center.y,
            land.rad * (center.z / radius + 0.3)
          );
          landGrad.addColorStop(0, 'rgba(16, 185, 129, 0.45)');
          landGrad.addColorStop(0.65, 'rgba(13, 148, 136, 0.28)');
          landGrad.addColorStop(1, 'rgba(13, 148, 136, 0)');

          ctx.beginPath();
          ctx.arc(center.x, center.y, land.rad * (center.z / radius + 0.4), 0, Math.PI * 2);
          ctx.fillStyle = landGrad;
          ctx.fill();
        }
      });

      // 5. Flight Connection Arcs (Curved routes between global cities)
      FLIGHT_ROUTES.forEach(([fromIdx, toIdx]) => {
        const p1 = LANDMARK_NODES[fromIdx];
        const p2 = LANDMARK_NODES[toIdx];
        const pt1 = project(p1.lat, p1.lng, rotation);
        const pt2 = project(p2.lat, p2.lng, rotation);

        if (pt1.visible || pt2.visible) {
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);

          // Bezier control point lifted above the sphere
          const midX = (pt1.x + pt2.x) / 2;
          const midY = (pt1.y + pt2.y) / 2 - 25;

          ctx.quadraticCurveTo(midX, midY, pt2.x, pt2.y);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 6. Landmark City Beacon Nodes with Pulsing Rings
      LANDMARK_NODES.forEach((node) => {
        const pt = project(node.lat, node.lng, rotation);
        if (pt.visible) {
          const nodeScale = Math.max(0.4, (pt.z + radius) / (radius * 2));
          const nodeR = 3.5 * nodeScale;

          // Inner solid core
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.shadowBlur = 8;
          ctx.shadowColor = node.color;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Animated pulse ring
          const ringR = nodeR + ((pulse * 8) % 10) * nodeScale;
          const ringAlpha = Math.max(0, 1 - (ringR - nodeR) / 10);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${ringAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // 7. Atmospheric Sunlit Rim Highlight (Sunlight reflection on top-left edge)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();

      const sunRim = ctx.createRadialGradient(
        cx - radius * 0.85,
        cy - radius * 0.85,
        radius * 0.2,
        cx,
        cy,
        radius
      );
      sunRim.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      sunRim.addColorStop(0.25, 'rgba(45, 212, 191, 0.25)');
      sunRim.addColorStop(0.65, 'rgba(0, 0, 0, 0)');
      sunRim.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

      ctx.fillStyle = sunRim;
      ctx.fill();
      ctx.restore();

      // Outer rim sharp border line
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size, shouldReduceMotion]);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="max-w-full h-auto drop-shadow-[0_0_60px_rgba(13,148,136,0.35)]"
      />
    </div>
  );
};
