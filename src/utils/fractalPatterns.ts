interface Point {
  x: number;
  y: number;
}

export const generateMandelbrotPoint = (x: number, y: number, iterations: number = 20): number => {
  let real = x;
  let imag = y;
  
  for (let i = 0; i < iterations; i++) {
    const tempReal = real * real - imag * imag + x;
    imag = 2 * real * imag + y;
    real = tempReal;
    
    if (real * real + imag * imag > 4) {
      return i / iterations;
    }
  }
  return 1;
};

export const generateSpiralPoints = (centerX: number, centerY: number, count: number): Point[] => {
  const points: Point[] = [];
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const goldenAngle = Math.PI * 2 * (1 - 1 / goldenRatio);
  
  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle;
    const radius = Math.sqrt(i) * 5;
    points.push({
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    });
  }
  
  return points;
};

export const generateSacredGeometryPoints = (
  centerX: number,
  centerY: number,
  radius: number,
  complexity: number
): Point[] => {
  const points: Point[] = [];
  const circles = 6 + complexity;
  
  for (let i = 0; i < circles; i++) {
    const angle = (Math.PI * 2 * i) / circles;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Create flower of life pattern
    for (let j = 0; j < circles; j++) {
      const innerAngle = (Math.PI * 2 * j) / circles;
      points.push({
        x: x + Math.cos(innerAngle) * radius * 0.5,
        y: y + Math.sin(innerAngle) * radius * 0.5,
      });
    }
  }
  
  return points;
};

export const generateLissajousPoint = (t: number, a: number, b: number, delta: number): Point => {
  return {
    x: Math.sin(a * t + delta),
    y: Math.sin(b * t),
  };
};

export const generateRecursivePattern = (
  x: number,
  y: number,
  size: number,
  depth: number,
  maxDepth: number
): Point[] => {
  if (depth >= maxDepth) return [];
  
  const points: Point[] = [{ x, y }];
  const branches = 5;
  
  for (let i = 0; i < branches; i++) {
    const angle = (Math.PI * 2 * i) / branches + depth * 0.5;
    const newSize = size * 0.6;
    const newX = x + Math.cos(angle) * size;
    const newY = y + Math.sin(angle) * size;
    
    points.push({ x: newX, y: newY });
    points.push(...generateRecursivePattern(newX, newY, newSize, depth + 1, maxDepth));
  }
  
  return points;
};

export const generateVoronoiPattern = (width: number, height: number, pointCount: number): Point[] => {
  const points: Point[] = [];
  
  for (let i = 0; i < pointCount; i++) {
    points.push({
      x: Math.random() * width,
      y: Math.random() * height,
    });
  }
  
  return points;
};

export const generateSierpinskiTriangle = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  depth: number,
  maxDepth: number
): Point[] => {
  if (depth >= maxDepth) {
    return [
      { x: x1, y: y1 },
      { x: x2, y: y2 },
      { x: x3, y: y3 },
    ];
  }
  
  const mid1 = { x: (x1 + x2) / 2, y: (y1 + y2) / 2 };
  const mid2 = { x: (x2 + x3) / 2, y: (y2 + y3) / 2 };
  const mid3 = { x: (x3 + x1) / 2, y: (y3 + y1) / 2 };
  
  return [
    ...generateSierpinskiTriangle(x1, y1, mid1.x, mid1.y, mid3.x, mid3.y, depth + 1, maxDepth),
    ...generateSierpinskiTriangle(mid1.x, mid1.y, x2, y2, mid2.x, mid2.y, depth + 1, maxDepth),
    ...generateSierpinskiTriangle(mid3.x, mid3.y, mid2.x, mid2.y, x3, y3, depth + 1, maxDepth),
  ];
};

export const generateDragonCurve = (
  startX: number,
  startY: number,
  length: number,
  angle: number,
  depth: number,
  maxDepth: number
): Point[] => {
  if (depth >= maxDepth) {
    return [
      { x: startX, y: startY },
      { x: startX + Math.cos(angle) * length, y: startY + Math.sin(angle) * length },
    ];
  }
  
  const newLength = length / Math.sqrt(2);
  const leftPoints = generateDragonCurve(startX, startY, newLength, angle - Math.PI / 4, depth + 1, maxDepth);
  const lastPoint = leftPoints[leftPoints.length - 1];
  const rightPoints = generateDragonCurve(lastPoint.x, lastPoint.y, newLength, angle + Math.PI / 4, depth + 1, maxDepth);
  
  return [...leftPoints, ...rightPoints];
};
