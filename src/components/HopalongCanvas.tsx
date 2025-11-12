import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HopalongCanvasProps {
  colorPalette: string[];
  speed: number;
}

const HopalongPoints = ({ colorPalette }: { colorPalette: string[] }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [params, setParams] = useState({ a: 0.4, b: 1.0, c: 0.0 });
  const timeRef = useRef(0);
  const transitionRef = useRef({ target: { a: 0.4, b: 1.0, c: 0.0 }, duration: 0 });
  
  useEffect(() => {
    // Generate random target parameters every 8-12 seconds (much slower)
    const interval = setInterval(() => {
      transitionRef.current = {
        target: {
          a: (Math.random() - 0.5) * 6,
          b: (Math.random() - 0.5) * 5,
          c: (Math.random() - 0.5) * 3,
        },
        duration: 10 + Math.random() * 5,
      };
    }, (10 + Math.random() * 5) * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    
    // Ultra smooth, fluid interpolation for organic morphing
    const t = Math.min(delta * 0.02, 1);
    setParams(prev => ({
      a: prev.a + (transitionRef.current.target.a - prev.a) * t,
      b: prev.b + (transitionRef.current.target.b - prev.b) * t,
      c: prev.c + (transitionRef.current.target.c - prev.c) * t,
    }));
  });
  
  useEffect(() => {
    if (!pointsRef.current) return;

    const iterations = 200000; // Even more points for immersive detail
    const positions = new Float32Array(iterations * 3);
    const colors = new Float32Array(iterations * 3);
    
    let x = 0;
    let y = 0;
    
    // Generate Hopalong Attractor points
    for (let i = 0; i < iterations; i++) {
      const xx = y - Math.sign(x) * Math.sqrt(Math.abs(params.b * x - params.c));
      const yy = params.a - x;
      
      x = xx;
      y = yy;
      
      // Massive scale to completely immerse the viewer
      positions[i * 3] = x * 1.2;
      positions[i * 3 + 1] = y * 1.2;
      positions[i * 3 + 2] = (i / iterations) * 800 - 400; // Very deep space
      
      // Dynamic color based on position and iteration
      const colorIndex = Math.floor((i / iterations) * colorPalette.length) % colorPalette.length;
      const nextColorIndex = (colorIndex + 1) % colorPalette.length;
      const colorMix = (i / iterations * colorPalette.length) % 1;
      
      const color1 = new THREE.Color(colorPalette[colorIndex]);
      const color2 = new THREE.Color(colorPalette[nextColorIndex]);
      const color = color1.lerp(color2, colorMix);
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = pointsRef.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
  }, [params, colorPalette]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.25}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CameraAnimation = ({ speed }: { speed: number }) => {
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Smooth, fluid forward motion through the fractal
    const flightSpeed = 4 * speed;
    state.camera.position.z -= delta * flightSpeed;
    
    // Reset when we've flown through
    if (state.camera.position.z < -350) {
      state.camera.position.z = 350;
    }
    
    // Smooth, organic camera drift for fluid motion
    state.camera.position.x = Math.sin(timeRef.current * 0.08) * 8 + Math.sin(timeRef.current * 0.23) * 4;
    state.camera.position.y = Math.cos(timeRef.current * 0.09) * 8 + Math.cos(timeRef.current * 0.17) * 4;
    
    // Subtle rotation for more organic feel
    state.camera.rotation.z = Math.sin(timeRef.current * 0.05) * 0.05;
    
    state.camera.lookAt(0, 0, state.camera.position.z - 100);
  });
  
  return null;
};

export const HopalongCanvas = ({ colorPalette, speed }: HopalongCanvasProps) => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 350], fov: 110 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.8} />
        <pointLight position={[50, 50, 200]} intensity={2} />
        <pointLight position={[-50, -50, 200]} intensity={1.5} />
        <pointLight position={[0, 0, -100]} intensity={1.2} />
        <HopalongPoints colorPalette={colorPalette} />
        <CameraAnimation speed={speed} />
      </Canvas>
    </div>
  );
};
