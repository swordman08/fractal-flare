import { useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

interface HopalongCanvasProps {
  colorPalette: string[];
  a: number;
  b: number;
  c: number;
}

const HopalongPoints = ({ colorPalette, a, b, c }: HopalongCanvasProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  
  useEffect(() => {
    if (!pointsRef.current) return;

    const iterations = 100000;
    const positions = new Float32Array(iterations * 3);
    const colors = new Float32Array(iterations * 3);
    
    let x = 0;
    let y = 0;
    
    // Generate Hopalong Attractor points
    for (let i = 0; i < iterations; i++) {
      const xx = y - Math.sign(x) * Math.sqrt(Math.abs(b * x - c));
      const yy = a - x;
      
      x = xx;
      y = yy;
      
      // Scale down the coordinates for better viewing
      positions[i * 3] = x * 0.05;
      positions[i * 3 + 1] = y * 0.05;
      positions[i * 3 + 2] = (i / iterations) * 5 - 2.5; // Spread across z-axis
      
      // Color based on position and iteration
      const colorIndex = Math.floor((i / iterations) * colorPalette.length) % colorPalette.length;
      const color = new THREE.Color(colorPalette[colorIndex]);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    const geometry = pointsRef.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingSphere();
  }, [a, b, c, colorPalette]);

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export const HopalongCanvas = ({ colorPalette, a, b, c }: HopalongCanvasProps) => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <HopalongPoints colorPalette={colorPalette} a={a} b={b} c={c} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
        />
      </Canvas>
    </div>
  );
};
