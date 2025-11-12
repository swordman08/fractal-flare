import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Stats } from "@/utils/stats";

interface HopalongCanvasProps {
  colorPalette: string[];
  speed: number;
}

const SCALE_FACTOR = 2000;
const NUM_POINTS_SUBSET = 50000;
const NUM_SUBSETS = 6;
const NUM_LEVELS = 5;
const LEVEL_DEPTH = 400;

interface OrbitData {
  positions: Float32Array;
  colors: Float32Array;
}

const generateHopalongOrbit = (colorPalette: string[], hueOffset: number): OrbitData => {
  // Parameter ranges from original
  const a = -30 + Math.random() * 60;
  const b = 0.2 + Math.random() * 1.6;
  const c = 5 + Math.random() * 12;
  const d = Math.random() * 10;
  const e = Math.random() * 12;
  
  const choice = Math.random();
  const positions = new Float32Array(NUM_POINTS_SUBSET * 3);
  const colors = new Float32Array(NUM_POINTS_SUBSET * 3);
  
  let x = 0.1 * (0.5 - Math.random());
  let y = 0.1 * (0.5 - Math.random());
  let xMin = 0, xMax = 0, yMin = 0, yMax = 0;
  
  const points: Array<{ x: number; y: number }> = [];
  
  // Generate orbit points using Hopalong formula
  for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
    let z;
    
    // Three formula variations from original
    if (choice < 0.5) {
      z = d + Math.sqrt(Math.abs(b * x - c));
    } else if (choice < 0.75) {
      z = d + Math.sqrt(Math.sqrt(Math.abs(b * x - c)));
    } else {
      z = d + Math.log(2 + Math.sqrt(Math.abs(b * x - c)));
    }
    
    let x1;
    if (x > 0) {
      x1 = y - z;
    } else if (x === 0) {
      x1 = y;
    } else {
      x1 = y + z;
    }
    
    y = a - x;
    x = x1 + e;
    
    points.push({ x, y });
    
    if (x < xMin) xMin = x;
    else if (x > xMax) xMax = x;
    if (y < yMin) yMin = y;
    else if (y > yMax) yMax = y;
  }
  
  // Normalize to SCALE_FACTOR
  const scaleX = (2 * SCALE_FACTOR) / (xMax - xMin);
  const scaleY = (2 * SCALE_FACTOR) / (yMax - yMin);
  
  // Apply normalization and colors
  for (let i = 0; i < NUM_POINTS_SUBSET; i++) {
    positions[i * 3] = scaleX * (points[i].x - xMin) - SCALE_FACTOR;
    positions[i * 3 + 1] = scaleY * (points[i].y - yMin) - SCALE_FACTOR;
    positions[i * 3 + 2] = 0;
    
    // Color based on position in orbit
    const colorIndex = Math.floor((i / NUM_POINTS_SUBSET) * colorPalette.length) % colorPalette.length;
    const color = new THREE.Color(colorPalette[colorIndex]);
    
    // Apply hue variation for each subset
    color.offsetHSL(hueOffset, 0, 0);
    
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }
  
  return { positions, colors };
};

const HopalongLayer = ({ 
  colorPalette, 
  level, 
  subset, 
  speed 
}: { 
  colorPalette: string[]; 
  level: number; 
  subset: number;
  speed: number;
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [orbitData, setOrbitData] = useState<OrbitData>(() => 
    generateHopalongOrbit(colorPalette, subset * 0.15)
  );
  
  useEffect(() => {
    // Regenerate orbit every 3 seconds
    const interval = setInterval(() => {
      const newData = generateHopalongOrbit(colorPalette, subset * 0.15);
      setOrbitData(newData);
      setNeedsUpdate(true);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [colorPalette, subset]);
  
  useFrame((state, delta) => {
    if (!pointsRef.current) return;
    
    // Move forward
    pointsRef.current.position.z += speed * delta * 60;
    
    // Gentle rotation
    pointsRef.current.rotation.z += 0.0003 * delta * 60;
    
    // Loop when passing camera
    if (pointsRef.current.position.z > state.camera.position.z) {
      pointsRef.current.position.z = -(NUM_LEVELS - 1) * LEVEL_DEPTH;
      
      if (needsUpdate) {
        pointsRef.current.geometry.setAttribute('position', 
          new THREE.BufferAttribute(orbitData.positions, 3)
        );
        pointsRef.current.geometry.setAttribute('color', 
          new THREE.BufferAttribute(orbitData.colors, 3)
        );
        pointsRef.current.geometry.attributes.position.needsUpdate = true;
        pointsRef.current.geometry.attributes.color.needsUpdate = true;
        setNeedsUpdate(false);
      }
    }
  });
  
  const initialZ = -LEVEL_DEPTH * level - (subset * LEVEL_DEPTH / NUM_SUBSETS);
  
  return (
    <points ref={pointsRef} position={[0, 0, initialZ]}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NUM_POINTS_SUBSET}
          array={orbitData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={NUM_POINTS_SUBSET}
          array={orbitData.colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={4}
        vertexColors
        transparent
        opacity={0.95}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthTest={false}
      />
    </points>
  );
};

const StatsMonitor = () => {
  const statsRef = useRef<Stats | null>(null);

  useEffect(() => {
    const stats = new Stats();
    statsRef.current = stats;
    document.body.appendChild(stats.domElement);

    return () => {
      if (statsRef.current) {
        document.body.removeChild(statsRef.current.domElement);
      }
    };
  }, []);

  useFrame(() => {
    if (statsRef.current) {
      statsRef.current.update();
    }
  });

  return null;
};

export const HopalongCanvas = ({ colorPalette, speed }: HopalongCanvasProps) => {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 0], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={["#000000"]} />
        <fog attach="fog" args={["#000000", 1, 3 * SCALE_FACTOR]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[100, 100, 100]} intensity={1.5} />
        <pointLight position={[-100, -100, 100]} intensity={1} />
        
        <StatsMonitor />
        
        {/* Create multiple levels and subsets */}
        {Array.from({ length: NUM_LEVELS }).map((_, level) =>
          Array.from({ length: NUM_SUBSETS }).map((_, subset) => (
            <HopalongLayer
              key={`${level}-${subset}`}
              colorPalette={colorPalette}
              level={level}
              subset={subset}
              speed={speed}
            />
          ))
        )}
      </Canvas>
    </div>
  );
};
