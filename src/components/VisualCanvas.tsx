import { useEffect, useRef, useState } from "react";
import {
  generateMandelbrotPoint,
  generateSpiralPoints,
  generateSacredGeometryPoints,
  generateLissajousPoint,
  generateRecursivePattern,
  generateSierpinskiTriangle,
  generateDragonCurve,
} from "@/utils/fractalPatterns";

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
  pattern?: "mandelbrot" | "spiral" | "sacred" | "lissajous" | "recursive" | "sierpinski" | "dragon";
  patternData?: any;
}

interface VisualCanvasProps {
  isDarkMode: boolean;
  colorPalette: string[];
  patternMode: "particles" | "fractals" | "waves" | "streak" | "laser" | "lightning" | "constellation" | "grid" | "ribbon";
}

export const VisualCanvas = ({ isDarkMode, colorPalette, patternMode }: VisualCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, isMoving: false });
  const mouseTrailRef = useRef<{ x: number; y: number }[]>([]);
  const laserBeamsRef = useRef<{ x1: number; y1: number; x2: number; y2: number; life: number; color: string }[]>([]);
  const gridNodesRef = useRef<{ x: number; y: number; active: boolean }[]>([]);
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
      
      // Update trail for streak pattern
      mouseTrailRef.current.push({ x: e.clientX, y: e.clientY });
      if (mouseTrailRef.current.length > 50) {
        mouseTrailRef.current.shift();
      }
      
      // Create pattern-specific effects
      if (patternMode === "streak") {
        if (mouseTrailRef.current.length > 1) {
          createParticle(e.clientX, e.clientY);
        }
      } else if (patternMode === "laser") {
        if (Math.random() > 0.7) {
          createLaserBeam(e.clientX, e.clientY);
        }
      } else if (patternMode === "lightning") {
        if (Math.random() > 0.9) {
          createLightning(e.clientX, e.clientY);
        }
      } else if (patternMode === "constellation") {
        createParticle(e.clientX, e.clientY);
      } else if (patternMode === "ribbon") {
        for (let i = 0; i < 2; i++) {
          createParticle(e.clientX, e.clientY);
        }
      } else {
        // Default particle trail
        for (let i = 0; i < 3; i++) {
          createParticle(e.clientX, e.clientY);
        }
      }
    };

    // Click handler - create burst with fractal patterns
    const handleClick = (e: MouseEvent) => {
      if (patternMode === "fractals") {
        createFractalBurst(e.clientX, e.clientY);
      } else if (patternMode === "laser") {
        createLaserShowBurst(e.clientX, e.clientY);
      } else if (patternMode === "lightning") {
        for (let i = 0; i < 5; i++) {
          createLightning(e.clientX, e.clientY);
        }
      } else if (patternMode === "grid") {
        createGridExplosion(e.clientX, e.clientY);
      } else {
        const particleCount = 30;
        for (let i = 0; i < particleCount; i++) {
          const angle = (Math.PI * 2 * i) / particleCount;
          createParticle(e.clientX, e.clientY, angle, true);
        }
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

    const createParticle = (x: number, y: number, angle?: number, isBurst = false, pattern?: any) => {
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
        pattern: pattern?.type,
        patternData: pattern?.data,
      });
    };

    const createFractalBurst = (x: number, y: number) => {
      const patterns = ["spiral", "sacred", "recursive", "sierpinski", "dragon", "mandelbrot"];
      const chosenPattern = patterns[Math.floor(Math.random() * patterns.length)];

      switch (chosenPattern) {
        case "spiral":
          const spiralPoints = generateSpiralPoints(x, y, 50);
          spiralPoints.forEach((point, i) => {
            const angle = Math.atan2(point.y - y, point.x - x);
            createParticle(point.x, point.y, angle, false, { type: "spiral" });
          });
          break;

        case "sacred":
          const sacredPoints = generateSacredGeometryPoints(x, y, 50, 2);
          sacredPoints.forEach((point) => {
            const angle = Math.atan2(point.y - y, point.x - x);
            createParticle(point.x, point.y, angle, false, { type: "sacred" });
          });
          break;

        case "recursive":
          const recursivePoints = generateRecursivePattern(x, y, 40, 0, 3);
          recursivePoints.forEach((point) => {
            const angle = Math.atan2(point.y - y, point.x - x);
            createParticle(point.x, point.y, angle, false, { type: "recursive" });
          });
          break;

        case "sierpinski":
          const size = 100;
          const sierpinskiPoints = generateSierpinskiTriangle(
            x, y - size,
            x - size, y + size,
            x + size, y + size,
            0, 4
          );
          sierpinskiPoints.forEach((point) => {
            createParticle(point.x, point.y, undefined, false, { type: "sierpinski" });
          });
          break;

        case "dragon":
          const dragonPoints = generateDragonCurve(x, y, 80, 0, 0, 8);
          dragonPoints.forEach((point) => {
            createParticle(point.x, point.y, undefined, false, { type: "dragon" });
          });
          break;

        case "mandelbrot":
          // Create mandelbrot-inspired burst
          for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 100;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;
            
            const mandelbrotValue = generateMandelbrotPoint(
              (px - x) / 50,
              (py - y) / 50
            );
            
            if (mandelbrotValue < 0.8) {
              createParticle(px, py, angle, false, { 
                type: "mandelbrot", 
                data: mandelbrotValue 
              });
            }
          }
          break;
      }
    };

    const createLaserBeam = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const length = 200 + Math.random() * 400;
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      laserBeamsRef.current.push({
        x1: x,
        y1: y,
        x2: x + Math.cos(angle) * length,
        y2: y + Math.sin(angle) * length,
        life: 1,
        color,
      });
    };

    const createLaserShowBurst = (x: number, y: number) => {
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const length = 300 + Math.random() * 200;
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        
        laserBeamsRef.current.push({
          x1: x,
          y1: y,
          x2: x + Math.cos(angle) * length,
          y2: y + Math.sin(angle) * length,
          life: 1,
          color,
        });
      }
    };

    const createLightning = (x: number, y: number) => {
      const endX = x + (Math.random() - 0.5) * 400;
      const endY = y + (Math.random() - 0.5) * 400;
      const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      
      // Create jagged lightning path
      const segments = 10;
      let currentX = x;
      let currentY = y;
      
      for (let i = 0; i < segments; i++) {
        const nextX = x + (endX - x) * (i + 1) / segments + (Math.random() - 0.5) * 50;
        const nextY = y + (endY - y) * (i + 1) / segments + (Math.random() - 0.5) * 50;
        
        laserBeamsRef.current.push({
          x1: currentX,
          y1: currentY,
          x2: nextX,
          y2: nextY,
          life: 1,
          color,
        });
        
        currentX = nextX;
        currentY = nextY;
      }
    };

    const createGridExplosion = (x: number, y: number) => {
      const gridSize = 30;
      for (let i = -5; i <= 5; i++) {
        for (let j = -5; j <= 5; j++) {
          const px = x + i * gridSize;
          const py = y + j * gridSize;
          const angle = Math.atan2(j, i);
          createParticle(px, py, angle, true, { type: "grid" });
        }
      }
    };

    const drawParticles = () => {
      if (!canvas || !ctx) return;

      // Clear with background color
      ctx.fillStyle = isDarkMode ? "#000000" : "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw streak trail
      if (patternMode === "streak" && mouseTrailRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = colorPalette[0];
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        
        if (isDarkMode) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = colorPalette[0];
        }
        
        ctx.beginPath();
        mouseTrailRef.current.forEach((point, i) => {
          ctx.globalAlpha = i / mouseTrailRef.current.length;
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // Draw laser beams
      if (patternMode === "laser" || patternMode === "lightning") {
        laserBeamsRef.current = laserBeamsRef.current.filter((beam) => {
          beam.life -= 0.05;
          
          if (beam.life > 0) {
            ctx.save();
            ctx.strokeStyle = beam.color;
            ctx.lineWidth = patternMode === "lightning" ? 2 + Math.random() * 3 : 3;
            ctx.globalAlpha = beam.life;
            
            if (isDarkMode) {
              ctx.shadowBlur = 25;
              ctx.shadowColor = beam.color;
            }
            
            ctx.beginPath();
            ctx.moveTo(beam.x1, beam.y1);
            ctx.lineTo(beam.x2, beam.y2);
            ctx.stroke();
            ctx.restore();
          }
          
          return beam.life > 0;
        });
      }

      // Draw constellation connections
      if (patternMode === "constellation" && particlesRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = colorPalette[0];
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.3;
        
        for (let i = 0; i < particlesRef.current.length; i++) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p1 = particlesRef.current[i];
            const p2 = particlesRef.current[j];
            const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            
            if (dist < 150) {
              ctx.globalAlpha = (1 - dist / 150) * 0.5;
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
        ctx.restore();
      }

      // Draw grid lines
      if (patternMode === "grid") {
        ctx.save();
        ctx.strokeStyle = colorPalette[0];
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.2;
        
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

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
        } else if (patternMode === "ribbon") {
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.angle += 0.1;
          particle.x += Math.cos(particle.angle) * 2;
          particle.y += Math.sin(particle.angle) * 2;
        } else if (patternMode === "streak") {
          particle.vx *= 0.97;
          particle.vy *= 0.97;
        } else if (patternMode === "constellation") {
          particle.vx *= 0.98;
          particle.vy *= 0.98;
        } else if (patternMode === "grid") {
          particle.vx *= 0.95;
          particle.vy *= 0.95;
        } else {
          particle.vx *= 0.99;
          particle.vy += 0.02; // slight gravity
        }

        // Draw particle
        if (particle.life > 0) {
          ctx.save();
          
          // Enhanced glow effect for OLED
          if (isDarkMode) {
            ctx.shadowBlur = 20;
            ctx.shadowColor = particle.color;
          }
          
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          ctx.strokeStyle = particle.color;
          ctx.lineWidth = 2;
          
          if (patternMode === "fractals" || particle.pattern) {
            // Draw complex fractal shapes based on pattern type
            switch (particle.pattern) {
              case "mandelbrot":
                // Complex mandelbrot visualization
                const intensity = particle.patternData || 0.5;
                ctx.globalAlpha = particle.life * intensity;
                ctx.beginPath();
                const rays = 8;
                for (let i = 0; i < rays; i++) {
                  const angle = (Math.PI * 2 * i) / rays + particle.angle;
                  const length = particle.size * (1 + intensity);
                  ctx.moveTo(particle.x, particle.y);
                  ctx.lineTo(
                    particle.x + Math.cos(angle) * length,
                    particle.y + Math.sin(angle) * length
                  );
                }
                ctx.stroke();
                break;

              case "spiral":
              case "sacred":
                // Sacred geometry circles
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
                ctx.stroke();
                break;

              case "recursive":
                // Branching pattern
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                  const angle = (Math.PI * 2 * i) / 3 + particle.angle;
                  const x = particle.x + Math.cos(angle) * particle.size * 2;
                  const y = particle.y + Math.sin(angle) * particle.size * 2;
                  ctx.moveTo(particle.x, particle.y);
                  ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
                ctx.fill();
                break;

              case "sierpinski":
                // Triangle pattern
                ctx.beginPath();
                for (let i = 0; i < 3; i++) {
                  const angle = (Math.PI * 2 * i) / 3 + particle.angle;
                  const x = particle.x + Math.cos(angle) * particle.size;
                  const y = particle.y + Math.sin(angle) * particle.size;
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                break;

              case "dragon":
                // Dragon curve segments
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
                const dragonAngle = particle.angle + Date.now() * 0.001;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(
                  particle.x + Math.cos(dragonAngle) * particle.size * 3,
                  particle.y + Math.sin(dragonAngle) * particle.size * 3
                );
                ctx.stroke();
                break;

              default:
                // Default fractal star
                ctx.beginPath();
                const points = 6;
                for (let i = 0; i < points; i++) {
                  const angle = (Math.PI * 2 * i) / points + particle.angle;
                  const x = particle.x + Math.cos(angle) * particle.size;
                  const y = particle.y + Math.sin(angle) * particle.size;
                  if (i === 0) ctx.moveTo(x, y);
                  else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.fill();
            }
          } else {
            // Draw enhanced circles with ring
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add outer ring for depth
            ctx.globalAlpha = particle.life * 0.3;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
            ctx.stroke();
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
