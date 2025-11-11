import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  angle: number;
  speed: number;
}

interface VisualCanvasProps {
  isDarkMode: boolean;
  colorPalette: string[];
  patternMode: "particles" | "fractals" | "waves";
}

export const VisualCanvas = ({ isDarkMode, colorPalette, patternMode }: VisualCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, isMoving: true };
      
      // Create particles on mouse trail
      for (let i = 0; i < 3; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };

    // Click handler - create burst
    const handleClick = (e: MouseEvent) => {
      const particleCount = patternMode === "fractals" ? 50 : 30;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        createParticle(e.clientX, e.clientY, angle, true);
      }
    };

    // Keyboard handler
    const handleKeyPress = (e: KeyboardEvent) => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      
      for (let i = 0; i < 20; i++) {
        createParticle(x, y);
      }
    };

    const createParticle = (x: number, y: number, angle?: number, isBurst = false) => {
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      const particleAngle = angle ?? Math.random() * Math.PI * 2;
      const speed = isBurst ? 3 + Math.random() * 5 : 1 + Math.random() * 2;

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(particleAngle) * speed,
        vy: Math.sin(particleAngle) * speed,
        life: 1,
        maxLife: 1,
        size: patternMode === "fractals" ? 2 + Math.random() * 4 : 3 + Math.random() * 6,
        color,
        angle: particleAngle,
        speed,
      });
    };

    const drawParticles = () => {
      if (!canvas || !ctx) return;

      // Clear with background color
      ctx.fillStyle = isDarkMode ? "#000000" : "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((particle) => {
        // Update physics
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.01;

        // Apply friction and gravity based on mode
        if (patternMode === "waves") {
          particle.vx *= 0.99;
          particle.vy = Math.sin(particle.x * 0.01 + Date.now() * 0.001) * 2;
        } else if (patternMode === "fractals") {
          particle.vx *= 0.98;
          particle.vy *= 0.98;
          particle.angle += 0.05;
          particle.vx += Math.cos(particle.angle) * 0.1;
          particle.vy += Math.sin(particle.angle) * 0.1;
        } else {
          particle.vx *= 0.99;
          particle.vy += 0.02; // slight gravity
        }

        // Draw particle
        if (particle.life > 0) {
          ctx.save();
          
          // Glow effect for OLED
          if (isDarkMode) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = particle.color;
          }
          
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          
          if (patternMode === "fractals") {
            // Draw fractal-like shapes
            ctx.beginPath();
            const points = 5;
            for (let i = 0; i < points; i++) {
              const angle = (Math.PI * 2 * i) / points + particle.angle;
              const x = particle.x + Math.cos(angle) * particle.size;
              const y = particle.y + Math.sin(angle) * particle.size;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
          } else {
            // Draw circles
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
          }
          
          ctx.restore();
        }

        return particle.life > 0 && 
               particle.x > -50 && particle.x < canvas.width + 50 &&
               particle.y > -50 && particle.y < canvas.height + 50;
      });

      // Continue animation
      animationRef.current = requestAnimationFrame(drawParticles);
    };

    // Start animation
    drawParticles();

    // Add event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
      window.removeEventListener("keypress", handleKeyPress);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isDarkMode, colorPalette, patternMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 cursor-crosshair"
      style={{ touchAction: "none" }}
    />
  );
};
