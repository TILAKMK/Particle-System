
import React, { useEffect, useRef } from 'react';
import { ParticleConfig, BehaviorType, Vector } from '../types';

interface Particle {
  pos: Vector;
  vel: Vector;
  acc: Vector;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface ParticleEngineProps {
  config: ParticleConfig;
  externalPos?: Vector;
  isInteractionActive?: boolean;
}

const ParticleEngine: React.FC<ParticleEngineProps> = ({ config, externalPos, isInteractionActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const mouseRef = useRef<Vector>({ x: 0, y: 0 });
  const prevTargetPosRef = useRef<Vector>({ x: 0, y: 0 });
  const targetVelRef = useRef<Vector>({ x: 0, y: 0 });

  const getTargetPos = () => {
    return externalPos || mouseRef.current;
  };

  const createParticle = (width: number, height: number): Particle => {
    const size = Math.random() * (config.sizeMax - config.sizeMin) + config.sizeMin;
    const color = config.colorRange[Math.floor(Math.random() * config.colorRange.length)];
    
    const target = getTargetPos();
    const spawnX = target.x || width / 2;
    const spawnY = target.y || height / 2;

    // Base random velocity
    let velX = (Math.random() - 0.5) * config.speed;
    let velY = (Math.random() - 0.5) * config.speed;

    // Inherit momentum from the emitter
    velX += targetVelRef.current.x * 0.15;
    velY += targetVelRef.current.y * 0.15;

    let pos: Vector = { x: spawnX, y: spawnY };
    let vel: Vector = { x: velX, y: velY };

    if (config.behavior === BehaviorType.FOUNTAIN) {
      vel = { 
        x: (Math.random() - 0.5) * config.speed + (targetVelRef.current.x * 0.2), 
        y: -Math.random() * config.speed * 2 + (targetVelRef.current.y * 0.2) 
      };
    }

    return {
      pos,
      vel,
      acc: { x: config.wind, y: config.gravity },
      size,
      color,
      alpha: 1,
      life: Math.random() * config.life + (config.life * 0.5),
      maxLife: config.life
    };
  };

  const update = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);

    const target = getTargetPos();
    targetVelRef.current = {
      x: target.x - prevTargetPosRef.current.x,
      y: target.y - prevTargetPosRef.current.y
    };
    prevTargetPosRef.current = { ...target };

    // Maintain particle count - emit more on movement
    const spawnRate = Math.abs(targetVelRef.current.x) + Math.abs(targetVelRef.current.y) > 2 ? 10 : 3;
    if (particlesRef.current.length < config.count) {
      for(let j = 0; j < spawnRate; j++) {
        if (particlesRef.current.length < config.count) {
          particlesRef.current.push(createParticle(width, height));
        }
      }
    }

    ctx.save();
    if (config.glow) {
      ctx.shadowBlur = config.blur;
    }

    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];

      // Physics logic
      p.vel.x += p.acc.x;
      p.vel.y += p.acc.y;
      p.vel.x *= config.friction;
      p.vel.y *= config.friction;
      
      // Pinch Gesture interaction (stronger attraction)
      if (isInteractionActive) {
        const dx = p.pos.x - target.x;
        const dy = p.pos.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const pull = (Math.max(0, 800 - dist)) * 0.005;
          p.vel.x -= (dx / dist) * pull;
          p.vel.y -= (dy / dist) * pull;
        }
      }

      // Behavior modifiers
      if (config.behavior === BehaviorType.VORTEX) {
        const dx = p.pos.x - target.x;
        const dy = p.pos.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 1) {
          const force = 0.2;
          p.vel.x += -dy / dist * force;
          p.vel.y += dx / dist * force;
        }
      } else if (config.behavior === BehaviorType.ORBIT) {
        const dx = p.pos.x - target.x;
        const dy = p.pos.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 400) {
          const pull = (400 - dist) * 0.0008;
          p.vel.x -= dx * pull;
          p.vel.y -= dy * pull;
        }
      }

      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);

      // Draw
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      if (config.glow) ctx.shadowColor = p.color;
      
      ctx.beginPath();
      ctx.arc(p.pos.x, p.pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();

      // Remove dead or off-screen particles
      if (p.life <= 0 || p.pos.x < -400 || p.pos.x > width + 400 || p.pos.y < -400 || p.pos.y > height + 400) {
        particlesRef.current.splice(i, 1);
      }
    }
    ctx.restore();

    requestRef.current = requestAnimationFrame(() => update(ctx, width, height));
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    requestRef.current = requestAnimationFrame(() => update(ctx, canvas.width, canvas.height));

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [config, externalPos, isInteractionActive]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0"
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleEngine;
