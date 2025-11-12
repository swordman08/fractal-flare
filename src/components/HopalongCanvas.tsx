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
          a: (Math.random() - 0.5) * 8,
          b: (Math.random() - 0.5) * 6,
          c: (Math.random() - 0.5) * 4,
        },
        duration: 8 + Math.random() * 4,
      };
    }, (8 + Math.random() * 4) * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    
    // Much smoother interpolation to target parameters
    const t = Math.min(delta * 0.05, 1);
    setParams(prev => ({
      a: prev.a + (transitionRef.current.target.a - prev.a) * t,
      b: prev.b + (transitionRef.current.target.b - prev.b) * t,
      c: prev.c + (transitionRef.current.target.c - prev.c) * t,
    }));
  });
  
  useEffect(() => {
    if (!pointsRef.current) return;

    const iterations = 150000; // More points for more detail
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
      
      // Much larger scale to fill entire screen and beyond
      positions[i * 3] = x * 0.4;
      positions[i * 3 + 1] = y * 0.4;
      positions[i * 3 + 2] = (i / iterations) * 400 - 200; // Much deeper z-axis spread
      
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
        size={0.15}
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
    
    // Fly forward through the fractal - moving towards negative z
    const flightSpeed = 3 * speed;
    state.camera.position.z -= delta * flightSpeed;
    
    // Reset when we've flown through
    if (state.camera.position.z < -180) {
      state.camera.position.z = 180;
    }
    
    // Very gentle drift side to side for subtle dynamic feel
    state.camera.position.x = Math.sin(timeRef.current * 0.15) * 3;
    state.camera.position.y = Math.cos(timeRef.current * 0.12) * 3;
    
    state.camera.lookAt(0, 0, state.camera.position.z - 80);
  });
  
  return null;
};

export const HopalongCanvas = ({ colorPalette, speed }: HopalongCanvasProps) => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 180], fov: 100 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.6} />
        <pointLight position={[20, 20, 100]} intensity={1.5} />
        <pointLight position={[-20, -20, 100]} intensity={1} />
        <pointLight position={[0, 0, -50]} intensity={0.8} />
        <HopalongPoints colorPalette={colorPalette} />
        <CameraAnimation speed={speed} />
      </Canvas>
    </div>
  );
};
