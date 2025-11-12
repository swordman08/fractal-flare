import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface HopalongCanvasProps {
  colorPalette: string[];
  a: number;
  b: number;
  c: number;
}

const HopalongPoints = ({ colorPalette }: { colorPalette: string[] }) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [params, setParams] = useState({ a: 0.4, b: 1.0, c: 0.0 });
  const timeRef = useRef(0);
  const transitionRef = useRef({ target: { a: 0.4, b: 1.0, c: 0.0 }, duration: 0 });
  
  useEffect(() => {
    // Generate random target parameters every 3-5 seconds
    const interval = setInterval(() => {
      transitionRef.current = {
        target: {
          a: (Math.random() - 0.5) * 10,
          b: (Math.random() - 0.5) * 8,
          c: (Math.random() - 0.5) * 6,
        },
        duration: 3 + Math.random() * 2,
      };
    }, (3 + Math.random() * 2) * 1000);
    
    return () => clearInterval(interval);
  }, []);

  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    timeRef.current += delta;
    
    // Smoothly interpolate to target parameters
    const t = Math.min(delta * 0.3, 1);
    setParams(prev => ({
      a: prev.a + (transitionRef.current.target.a - prev.a) * t,
      b: prev.b + (transitionRef.current.target.b - prev.b) * t,
      c: prev.c + (transitionRef.current.target.c - prev.c) * t,
    }));
    
    // Rotate the entire point cloud slowly
    pointsRef.current.rotation.y += delta * 0.1;
    pointsRef.current.rotation.x = Math.sin(timeRef.current * 0.2) * 0.2;
  });
  
  useEffect(() => {
    if (!pointsRef.current) return;

    const iterations = 100000;
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
      
      // Scale down the coordinates for better viewing
      positions[i * 3] = x * 0.05;
      positions[i * 3 + 1] = y * 0.05;
      positions[i * 3 + 2] = (i / iterations) * 10 - 5; // Spread across z-axis
      
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
        size={0.04}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const CameraAnimation = () => {
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    
    // Flowing camera movement through the fractal
    const radius = 8 + Math.sin(timeRef.current * 0.2) * 3;
    const height = Math.sin(timeRef.current * 0.15) * 4;
    
    state.camera.position.x = Math.cos(timeRef.current * 0.3) * radius;
    state.camera.position.y = height;
    state.camera.position.z = Math.sin(timeRef.current * 0.3) * radius;
    
    state.camera.lookAt(0, 0, 0);
  });
  
  return null;
};

export const HopalongCanvas = ({ colorPalette }: Pick<HopalongCanvasProps, 'colorPalette'>) => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        <HopalongPoints colorPalette={colorPalette} />
        <CameraAnimation />
      </Canvas>
    </div>
  );
};
