import { PinwheelCenter, OceanEddy, VectorItem } from './types';

// Ruido Perlin integrado
export const noise = (() => {
  const p = new Uint8Array(512);
  const permutation = [
    151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,
    23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,
    174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,
    133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,
    89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,
    248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,
    232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,
    249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,
    236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180
  ];
  
  for (let i = 0; i < 256; i++) p[i] = p[i + 256] = permutation[i];

  function fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  function lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }
  
  function grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y, v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  return {
    noise2D: function(x: number, y: number): number {
      const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
      x -= Math.floor(x);
      y -= Math.floor(y);
      const fx = fade(x), fy = fade(y);
      const gi00 = p[X + p[Y]] % 12;
      const gi01 = p[X + p[Y + 1]] % 12;
      const gi10 = p[X + 1 + p[Y]] % 12;
      const gi11 = p[X + 1 + p[Y + 1]] % 12;
      const n00 = grad(gi00, x, y);
      const n10 = grad(gi10, x - 1, y);
      const n01 = grad(gi01, x, y - 1);
      const n11 = grad(gi11, x - 1, y - 1);
      const nx0 = lerp(fx, n00, n10);
      const nx1 = lerp(fx, n01, n11);
      return lerp(fy, nx0, nx1);
    }
  };
})();

// Conversión de coordenadas del espacio de pantalla al espacio SVG
export function getSVGCoordinates(svgElement: SVGSVGElement, event: MouseEvent): { x: number | null, y: number | null } {
  try {
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    const CTM = svgElement.getScreenCTM();
    
    if (!CTM) {
      console.error("No CTM");
      return { x: null, y: null };
    }
    
    const inverseCTM = CTM.inverse();
    if (!inverseCTM) {
      console.error("No inverse CTM");
      return { x: null, y: null };
    }
    
    const svgCoords = svgPoint.matrixTransform(inverseCTM);
    return { x: svgCoords.x, y: svgCoords.y };
  } catch (error) {
    console.error("Error calculando coordenadas SVG:", error);
    return { x: null, y: null };
  }
}

// Obtenemos color para flockId
export function getColorByFlockId(flockId: number): string {
  const colors = [
    "#ffffff", // Blanco (default)
    "#64b5f6", // Azul claro
    "#81c784", // Verde claro
    "#e57373", // Rojo claro
    "#ffb74d", // Naranja
    "#ba68c8"  // Púrpura
  ];
  
  return colors[flockId % colors.length];
}

// Funciones de cálculo de ángulos para cada tipo de animación

export function calculateAngle_SmoothWaves(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number
): number {
  const normX = baseX / logicalWidth;
  const normY = baseY / logicalHeight;
  const angleOffset = Math.sin(normX * 10 + timeFactor) + Math.cos(normY * 10 + timeFactor);
  return angleOffset * 180;
}

export function calculateAngle_SeaWaves(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  seaWaveFrequency: number,
  seaWaveAmplitude: number
): number {
  const normX = baseX / logicalWidth;
  const normY = baseY / logicalHeight;
  const wave = Math.sin(normX * seaWaveFrequency + timeFactor * 2);
  const ripple = Math.cos(normY * 5 + timeFactor * 0.5);
  const angleOffset = (wave * 0.8 + ripple * 0.2);
  return angleOffset * seaWaveAmplitude;
}

export function calculateAngle_Pinwheels(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  pinwheelCenters: PinwheelCenter[]
): number {
  if (!pinwheelCenters || pinwheelCenters.length === 0) {
    return calculateAngle_SmoothWaves(baseX, baseY, timeFactor * 0.5, logicalWidth, logicalHeight);
  }
  
  let nearestCenter = null;
  let minDistSq = Infinity;
  
  pinwheelCenters.forEach(center => {
    const dx = baseX - center.x;
    const dy = baseY - center.y;
    const distSq = dx * dx + dy * dy;
    if (distSq < minDistSq) {
      minDistSq = distSq;
      nearestCenter = center;
    }
  });

  const maxDist = logicalWidth * 0.3;
  if (nearestCenter && minDistSq < maxDist * maxDist) {
    const dx_final = baseX - nearestCenter.x;
    const dy_final = baseY - nearestCenter.y;
    const angleToCenter = Math.atan2(dy_final, dx_final);
    const rotationSpeed = 4;
    const angleRadians = angleToCenter + Math.PI / 2 + timeFactor * rotationSpeed;
    return angleRadians * (180 / Math.PI);
  } else {
    return calculateAngle_SmoothWaves(baseX, baseY, timeFactor * 0.5, logicalWidth, logicalHeight);
  }
}

export function calculateAngle_CenterPulse(
  baseX: number,
  baseY: number,
  timeFactor: number,
  currentTime: number,
  lastPulseTime: number,
  logicalWidth: number,
  logicalHeight: number,
  pulseDuration: number = 500
): number {
  const timeSinceLastPulse = currentTime - lastPulseTime;
  if (timeSinceLastPulse < pulseDuration) {
    const centerX = logicalWidth / 2;
    const centerY = logicalHeight / 2;
    const dx = baseX - centerX;
    const dy = baseY - centerY;
    const radialAngleRad = Math.atan2(dy, dx);
    const radialAngleDeg = radialAngleRad * (180 / Math.PI);
    const progress = timeSinceLastPulse / pulseDuration;
    const intensity = 1 - progress * progress;
    const baseAngleDeg = calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
    let diff = radialAngleDeg - baseAngleDeg;
    while (diff <= -180) diff += 360;
    while (diff > 180) diff -= 360;
    const finalAngle = baseAngleDeg + diff * intensity;
    return finalAngle;
  } else {
    return calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
  }
}

export function calculateAngle_GeometricPattern(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number
): number {
  const centerX = logicalWidth / 2;
  const centerY = logicalHeight / 2;
  const dx = baseX - centerX;
  const dy = baseY - centerY;
  const angleToCenter = Math.atan2(dy, dx);
  let tangentialAngle = angleToCenter + Math.PI / 2;
  const rotationSpeed = 0.3;
  tangentialAngle += timeFactor * rotationSpeed;
  return tangentialAngle * (180 / Math.PI);
}

export function calculateAngle_Vortex(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  vortexInwardFactor: number
): number {
  const centerX = logicalWidth / 2;
  const centerY = logicalHeight / 2;
  const dx = baseX - centerX;
  const dy = baseY - centerY;
  const angleToCenter = Math.atan2(dy, dx);
  const tangentialAngle = angleToCenter + Math.PI / 2;
  const combinedAngle = tangentialAngle - vortexInwardFactor * (angleToCenter + Math.PI);
  const rotationSpeed = 0.4;
  const finalAngle = combinedAngle + timeFactor * rotationSpeed;
  return finalAngle * (180 / Math.PI);
}

export function calculateAngle_Jitter(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  jitterIntensity: number
): number {
  const baseAngle = calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
  const maxJitter = jitterIntensity;
  const jitterAmount = (Math.random() - 0.5) * 2 * maxJitter;
  return baseAngle + jitterAmount;
}

export function calculateAngle_FollowPath(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number
): number {
  const pathCenterY = logicalHeight / 2;
  const pathAmplitude = logicalHeight * 0.2;
  const pathFrequency = 4 * Math.PI / logicalWidth;
  const pathY = pathCenterY + pathAmplitude * Math.sin(baseX * pathFrequency + timeFactor);
  const distanceY = Math.abs(baseY - pathY);
  const influenceThreshold = logicalHeight * 0.1;
  
  if (distanceY < influenceThreshold) {
    const slope = pathAmplitude * pathFrequency * Math.cos(baseX * pathFrequency + timeFactor);
    const tangentAngle = Math.atan(slope);
    return tangentAngle * (180 / Math.PI);
  } else {
    return calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
  }
}

export function calculateAngle_OceanCurrents(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  oceanEddies: OceanEddy[]
): number {
  const baseAngle = calculateAngle_SmoothWaves(baseX, baseY, timeFactor * 0.2, logicalWidth, logicalHeight);
  let totalInfluenceWeight = 0;
  let weightedAngleSumRad = 0;
  const baseAngleRad = baseAngle * (Math.PI / 180);
  
  weightedAngleSumRad += baseAngleRad * 1.0;
  totalInfluenceWeight += 1.0;
  
  oceanEddies.forEach(eddy => {
    const dx = baseX - eddy.x;
    const dy = baseY - eddy.y;
    const distSq = dx * dx + dy * dy;
    const radiusSq = eddy.radius * eddy.radius;
    
    if (distSq < radiusSq) {
      const angleToCenter = Math.atan2(dy, dx);
      let tangentialAngle = angleToCenter + (Math.PI / 2) * eddy.direction;
      const rotationSpeed = 0.1 * eddy.direction;
      tangentialAngle += timeFactor * rotationSpeed;
      const distanceFactor = Math.sqrt(distSq) / eddy.radius;
      const weight = eddy.strength * (1 - distanceFactor);
      weightedAngleSumRad += tangentialAngle * weight;
      totalInfluenceWeight += weight;
    }
  });

  let finalAngleRad;
  if (totalInfluenceWeight > 0) {
    finalAngleRad = weightedAngleSumRad / totalInfluenceWeight;
  } else {
    finalAngleRad = baseAngleRad;
  }
  
  return finalAngleRad * (180 / Math.PI);
}

export function calculateAngle_RippleEffect(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  rippleWaveSpeed: number
): number {
  const centerX = logicalWidth / 2;
  const centerY = logicalHeight / 2;
  const dx = baseX - centerX;
  const dy = baseY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const waveLength = 150;
  const speed = rippleWaveSpeed * 100;
  const maxAngle = 60;
  const phase = (dist / waveLength - timeFactor * speed / waveLength) * Math.PI * 2;
  const angle = Math.sin(phase) * maxAngle;
  return angle;
}

export function calculateAngle_ExpandingWave(
  baseX: number,
  baseY: number,
  timeFactor: number,
  currentTime: number,
  layer: number,
  activationTime: number,
  currentAngle: number,
  animationSpeedFactor: number
): number {
  const timeSinceActivation = currentTime - activationTime;
  
  if (currentTime >= activationTime) {
    const rotationSpeedDegPerSec = animationSpeedFactor * 180;
    const angle = (timeSinceActivation / 1000) * rotationSpeedDegPerSec;
    return angle % 360;
  } else {
    return 90;
  }
}

export function calculateAngle_MouseInteraction(
  baseX: number,
  baseY: number,
  timeFactor: number,
  logicalWidth: number,
  logicalHeight: number,
  mouseX: number | null,
  mouseY: number | null,
  mouseInteractionRadiusPercent: number
): number {
  const interactionRadius = logicalWidth * (mouseInteractionRadiusPercent / 100);
  const interactionRadiusSq = interactionRadius * interactionRadius;
  
  if (mouseX !== null && mouseY !== null) {
    const dx = mouseX - baseX;
    const dy = mouseY - baseY;
    const distSq = dx * dx + dy * dy;
    
    if (distSq < interactionRadiusSq) {
      const angleRadians = Math.atan2(dy, dx);
      return angleRadians * (180 / Math.PI);
    } else {
      return calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
    }
  } else {
    return calculateAngle_SmoothWaves(baseX, baseY, timeFactor, logicalWidth, logicalHeight);
  }
}

export function calculateAngle_CellularAutomata(
  r: number,
  c: number,
  currentAngle: number,
  timeFactor: number,
  svgLines: VectorItem[],
  vectorGridMap: Map<string, number>,
  gridRows: number,
  calculatedGridCols: number,
  logicalWidth: number,
  logicalHeight: number
): number {
  let neighborAnglesSum = 0;
  let validNeighbors = 0;
  const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
  
  neighbors.forEach(([dr, dc]) => {
    const nr = r + dr;
    const nc = c + dc;
    const neighborIndex = vectorGridMap.get(`${nr}-${nc}`);
    
    if (neighborIndex !== undefined && nr >= 0 && nr < gridRows && nc >= 0 && nc < calculatedGridCols) {
      const neighbor = svgLines[neighborIndex];
      if (neighbor) {
        let diff = neighbor.currentAngle - currentAngle;
        while (diff <= -180) diff += 360;
        while (diff > 180) diff -= 360;
        neighborAnglesSum += (currentAngle + diff);
        validNeighbors++;
      }
    }
  });
  
  let avgNeighborAngle = currentAngle;
  if (validNeighbors > 0) {
    avgNeighborAngle = neighborAnglesSum / validNeighbors;
  }
  
  const currentItem = svgLines[vectorGridMap.get(`${r}-${c}`) || 0];
  const baseWaveAngle = calculateAngle_SmoothWaves(
    currentItem.baseX,
    currentItem.baseY,
    timeFactor * 0.1,
    logicalWidth,
    logicalHeight
  );
  
  const blendFactor = 0.8;
  let diffBlend = avgNeighborAngle - baseWaveAngle;
  while (diffBlend <= -180) diffBlend += 360;
  while (diffBlend > 180) diffBlend -= 360;
  const finalAngle = baseWaveAngle + diffBlend * blendFactor;
  
  return finalAngle;
}

export function calculateAngle_Lissajous(
  x: number,
  y: number,
  timeFactor: number,
  svgLines: VectorItem[]
): number {
  const A = 400;
  const B = 400;
  const a = 3;
  const b = 2;
  const delta = Math.PI / 2;
  const targetX = A * Math.sin(a * timeFactor * 2 + delta);
  const targetY = B * Math.sin(b * timeFactor * 2);
  const relativeX = (x % (A * 2)) - A;
  const relativeY = (y % (B * 2)) - B;
  const dx = targetX - relativeX;
  const dy = targetY - relativeY;
  
  if (Math.hypot(dx, dy) < 1) {
    const currentItem = svgLines.find(item => item.baseX === x && item.baseY === y);
    return currentItem ? currentItem.currentAngle : 90;
  }
  
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

export function calculateAngle_PerlinFlow(
  x: number,
  y: number,
  timeFactor: number,
  perlinNoiseScale: number,
  perlinTimeSpeed: number
): number {
  const scale = perlinNoiseScale;
  const t = timeFactor * perlinTimeSpeed;
  const noiseValue = noise.noise2D(x * scale, y * scale + t);
  const angle = ((noiseValue + 1) / 2) * 360;
  return angle % 360;
}

export function calculateAngle_Flocking(
  x: number,
  y: number,
  r: number,
  c: number,
  currentAngle: number,
  timeFactor: number,
  flockId: number,
  svgLines: VectorItem[],
  vectorGridMap: Map<string, number>,
  gridRows: number,
  calculatedGridCols: number,
  vectorSpacing: number,
  flockNeighborhoodRadius: number,
  flockAlignmentStrength: number,
  flockCohesionStrength: number,
  flockSeparationStrength: number,
  flockMouseAttraction: boolean,
  mouseX: number | null,
  mouseY: number | null,
  logicalWidth: number,
  logicalHeight: number,
  flockMouseAttractionStrength: number = 0.2
): number {
  const radius = flockNeighborhoodRadius;
  const radiusSq = radius * radius;
  const separationRadius = vectorSpacing * 1.5;
  const separationRadiusSq = separationRadius * separationRadius;
  
  let alignmentSumX = 0, alignmentSumY = 0, cohesionX = 0, cohesionY = 0;
  let separationSumX = 0, separationSumY = 0;
  let flockNeighborCount = 0, separationCount = 0;
  
  const searchRadius = Math.ceil(radius / vectorSpacing);
  
  for (let nr = Math.max(0, r - searchRadius); nr < Math.min(gridRows, r + searchRadius + 1); nr++) {
    for (let nc = Math.max(0, c - searchRadius); nc < Math.min(calculatedGridCols, c + searchRadius + 1); nc++) {
      if (nr === r && nc === c) continue;
      
      const neighborIndex = vectorGridMap.get(`${nr}-${nc}`);
      if (neighborIndex === undefined) continue;
      
      const neighbor = svgLines[neighborIndex];
      const dx = neighbor.baseX - x;
      const dy = neighbor.baseY - y;
      const distSq = dx * dx + dy * dy;
      
      if (distSq < separationRadiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        separationSumX -= dx / dist;
        separationSumY -= dy / dist;
        separationCount++;
      }
      
      if (distSq < radiusSq && neighbor.flockId === flockId) {
        const neighborAngleRad = neighbor.currentAngle * (Math.PI / 180);
        alignmentSumX += Math.cos(neighborAngleRad);
        alignmentSumY += Math.sin(neighborAngleRad);
        cohesionX += neighbor.baseX;
        cohesionY += neighbor.baseY;
        flockNeighborCount++;
      }
    }
  }
  
  let targetAngle = currentAngle;
  let finalVecX = 0;
  let finalVecY = 0;
  let totalWeight = 0;
  
  if (flockNeighborCount > 0) {
    const avgAlignmentX = alignmentSumX / flockNeighborCount;
    const avgAlignmentY = alignmentSumY / flockNeighborCount;
    const avgCohesionX = cohesionX / flockNeighborCount;
    const avgCohesionY = cohesionY / flockNeighborCount;
    
    finalVecX += avgAlignmentX * flockAlignmentStrength;
    finalVecY += avgAlignmentY * flockAlignmentStrength;
    totalWeight += flockAlignmentStrength;
    
    finalVecX += (avgCohesionX - x) * flockCohesionStrength * 0.01;
    finalVecY += (avgCohesionY - y) * flockCohesionStrength * 0.01;
    totalWeight += flockCohesionStrength;
  }
  
  if (separationCount > 0 && flockSeparationStrength > 0) {
    finalVecX += (separationSumX / separationCount) * flockSeparationStrength;
    finalVecY += (separationSumY / separationCount) * flockSeparationStrength;
    totalWeight += flockSeparationStrength;
  }
  
  if (flockMouseAttraction && mouseX !== null && mouseY !== null) {
    const dxMouse = mouseX - x;
    const dyMouse = mouseY - y;
    const distMouseSq = dxMouse * dxMouse + dyMouse * dyMouse;
    
    if (distMouseSq < radiusSq * 4) {
      const distMouse = Math.sqrt(distMouseSq);
      finalVecX += (dxMouse / distMouse) * flockMouseAttractionStrength;
      finalVecY += (dyMouse / distMouse) * flockMouseAttractionStrength;
      totalWeight += flockMouseAttractionStrength;
    }
  }
  
  if (totalWeight > 0 && (Math.abs(finalVecX) > 0.001 || Math.abs(finalVecY) > 0.001)) {
    targetAngle = Math.atan2(finalVecY, finalVecX) * (180 / Math.PI);
  } else if (flockNeighborCount === 0 && (!flockMouseAttraction || mouseX === null)) {
    targetAngle = calculateAngle_SmoothWaves(x, y, timeFactor * 0.1, logicalWidth, logicalHeight);
  }
  
  while (targetAngle <= -180) targetAngle += 360;
  while (targetAngle > 180) targetAngle -= 360;
  
  return targetAngle;
}
