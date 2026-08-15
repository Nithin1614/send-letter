"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  flipAngle: number;
  flipSpeed: number;
  opacity: number;
  maxLife: number;
  life: number;
  type: "petal" | "stardust" | "heart";
  color: string;
}

interface UnsealParticlesProps {
  active: boolean;
  type?: "petals" | "stardust" | "hearts" | "mixed";
}

export default function UnsealParticles({ active, type = "mixed" }: UnsealParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const particles: Particle[] = [];
    const count = 36;

    // Determine particle type distribution
    const getParticleType = (): "petal" | "stardust" | "heart" => {
      if (type === "petals") return "petal";
      if (type === "stardust") return "stardust";
      if (type === "hearts") return "heart";
      const r = Math.random();
      if (r < 0.55) return "petal";
      if (r < 0.85) return "stardust";
      return "heart";
    };

    const petalColors = ["#a8222c", "#8b1820", "#c4333e", "#701117", "#d94b56"];
    const stardustColors = ["#ffd700", "#ffec8b", "#ffe4b5", "#ffffff"];
    const heartColors = ["#e0303a", "#ff4d6d", "#c9184a"];

    for (let i = 0; i < count; i++) {
      const pType = getParticleType();
      const pColor =
        pType === "petal"
          ? petalColors[Math.floor(Math.random() * petalColors.length)]
          : pType === "stardust"
          ? stardustColors[Math.floor(Math.random() * stardustColors.length)]
          : heartColors[Math.floor(Math.random() * heartColors.length)];

      particles.push({
        x: Math.random() * width,
        y: Math.random() * -120 - 20, // Start slightly above screen
        size: pType === "petal" ? 14 + Math.random() * 12 : pType === "heart" ? 10 + Math.random() * 8 : 4 + Math.random() * 6,
        vx: (Math.random() - 0.5) * 1.2,
        vy: 1.2 + Math.random() * 1.8,
        angle: Math.random() * Math.PI * 2,
        angularVelocity: (Math.random() - 0.5) * 0.04,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: 0.02 + Math.random() * 0.04,
        opacity: 0,
        maxLife: 320 + Math.random() * 80,
        life: 0,
        type: pType,
        color: pColor,
      });
    }

    let animationFrameId: number;
    let totalFrames = 0;

    const render = () => {
      totalFrames++;
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        // Fade in rapidly, fade out towards end
        if (p.life < 40) {
          p.opacity = Math.min(1, p.life / 40);
        } else if (p.life > p.maxLife - 60) {
          p.opacity = Math.max(0, (p.maxLife - p.life) / 60);
        }

        if (p.opacity <= 0 && p.life > 40) continue;
        aliveCount++;

        // Organic sway
        p.x += p.vx + Math.sin(p.life * 0.03 + i) * 0.8;
        p.y += p.vy;
        p.angle += p.angularVelocity;
        p.flipAngle += p.flipSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.scale(Math.cos(p.flipAngle), 1); // 3D tumbling effect
        ctx.globalAlpha = p.opacity;

        if (p.type === "petal") {
          // Velvet Rose Petal
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.8);
          ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.5, p.size * 0.6, p.size * 0.7, 0, p.size);
          ctx.bezierCurveTo(-p.size * 0.6, p.size * 0.7, -p.size * 0.7, -p.size * 0.5, 0, -p.size * 0.8);
          ctx.fill();

          // Subtle petal highlight vein
          ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.5);
          ctx.lineTo(0, p.size * 0.6);
          ctx.stroke();
        } else if (p.type === "stardust") {
          // 4-point Golden Star
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          for (let s = 0; s < 4; s++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(0, p.size);
            ctx.lineTo(p.size * 0.25, p.size * 0.25);
          }
          ctx.fill();
        } else if (p.type === "heart") {
          // Mini Floating Heart
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const d = p.size * 0.6;
          ctx.moveTo(0, d * 0.5);
          ctx.bezierCurveTo(-d, -d * 0.5, -d * 1.5, d * 0.5, 0, d * 1.6);
          ctx.bezierCurveTo(d * 1.5, d * 0.5, d, -d * 0.5, 0, d * 0.5);
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0 && totalFrames < 400) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [active, type]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
}
