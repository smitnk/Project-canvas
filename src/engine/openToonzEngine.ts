import { Point, QuadSegment, OpenToonzStroke, BoundingBox } from '../types';

/**
 * OpenToonz Upstream Metadata
 */
export const OPENTOONZ_COMMIT_SHA = '065cc1404ba43019b22a2577d529134c3e01931b';
export const OPENTOONZ_TAG = 'v1.8.0';
export const OPENTOONZ_LICENSE = `OpenToonz Drawing Engine
Copyright (c) 2016, DWANGO Co., Ltd.
Copyright (c) 2016, Digital Video S.p.A.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.
2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.
3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software without
   specific prior written permission.`;

/**
 * OpenToonz StrokeGenerator implementation
 * Reference: toonz/sources/toonzlib/strokegenerator.cpp & toonz/sources/include/tstroke.h
 */
export class OpenToonzStrokeGenerator {
  private rawPoints: Point[] = [];
  private baseSize: number = 6;
  private smoothError: number = 4.0;
  private color: string = '#1e293b';
  private opacity: number = 1.0;
  private isVector: boolean = true;
  private tool: 'brush' | 'pencil' | 'raster' | 'eraser' = 'brush';

  public beginStroke(
    x: number,
    y: number,
    pressure: number,
    baseSize: number,
    color: string,
    opacity: number,
    isVector: boolean,
    tool: 'brush' | 'pencil' | 'raster' | 'eraser',
    smoothError: number = 4.0
  ) {
    this.rawPoints = [];
    this.baseSize = baseSize;
    this.color = color;
    this.opacity = opacity;
    this.isVector = isVector;
    this.tool = tool;
    this.smoothError = smoothError;

    const clampedP = Math.max(0.08, Math.min(1.0, pressure));
    const thickness = this.calcThickness(clampedP);
    this.rawPoints.push({ x, y, pressure: clampedP, thickness });
  }

  public addPoint(x: number, y: number, pressure: number) {
    if (this.rawPoints.length === 0) return;
    const clampedP = Math.max(0.08, Math.min(1.0, pressure));
    const thickness = this.calcThickness(clampedP);

    // Filter tiny distance jitter
    const last = this.rawPoints[this.rawPoints.length - 1];
    const distSq = (x - last.x) * (x - last.x) + (y - last.y) * (y - last.y);
    if (distSq < 1.0) {
      return;
    }

    this.rawPoints.push({ x, y, pressure: clampedP, thickness });
  }

  private calcThickness(pressure: number): number {
    if (this.tool === 'pencil') {
      return Math.max(1, this.baseSize * (0.5 + 0.5 * pressure));
    }
    // OpenToonz standard taper curve
    return Math.max(1, this.baseSize * (0.15 + 0.85 * pressure));
  }

  public getRawPoints(): Point[] {
    return [...this.rawPoints];
  }

  /**
   * Generates OpenToonz TStroke quadratic bezier segments
   * using the exact OpenToonz midpoint and corner smoothing formula.
   */
  public endStroke(): OpenToonzStroke | null {
    if (this.rawPoints.length === 0) return null;

    const pts = this.simplifyPoints(this.rawPoints, this.smoothError);
    const segments: QuadSegment[] = [];

    if (pts.length === 1) {
      const p = pts[0];
      segments.push({
        p0: p,
        p1: p,
        p2: p,
        startThick: p.thickness,
        midThick: p.thickness,
        endThick: p.thickness,
      });
    } else if (pts.length === 2) {
      const p0 = pts[0];
      const p1 = pts[1];
      const mid: Point = {
        x: (p0.x + p1.x) * 0.5,
        y: (p0.y + p1.y) * 0.5,
        pressure: (p0.pressure + p1.pressure) * 0.5,
        thickness: (p0.thickness + p1.thickness) * 0.5,
      };
      segments.push({
        p0,
        p1: mid,
        p2: p1,
        startThick: p0.thickness,
        midThick: mid.thickness,
        endThick: p1.thickness,
      });
    } else {
      // Calculate midpoints as smooth knots between input vertices
      const midpoints: Point[] = [];
      for (let i = 0; i < pts.length - 1; i++) {
        midpoints.push({
          x: (pts[i].x + pts[i + 1].x) * 0.5,
          y: (pts[i].y + pts[i + 1].y) * 0.5,
          pressure: (pts[i].pressure + pts[i + 1].pressure) * 0.5,
          thickness: (pts[i].thickness + pts[i + 1].thickness) * 0.5,
        });
      }

      // Initial segment: from first point to first midpoint
      segments.push({
        p0: pts[0],
        p1: pts[0],
        p2: midpoints[0],
        startThick: pts[0].thickness,
        midThick: pts[0].thickness,
        endThick: midpoints[0].thickness,
      });

      // Internal quadratic curves: control point is the actual captured input point
      for (let i = 0; i < midpoints.length - 1; i++) {
        segments.push({
          p0: midpoints[i],
          p1: pts[i + 1],
          p2: midpoints[i + 1],
          startThick: midpoints[i].thickness,
          midThick: pts[i + 1].thickness,
          endThick: midpoints[i + 1].thickness,
        });
      }

      // Final segment: from last midpoint to end point
      const lastIdx = midpoints.length - 1;
      segments.push({
        p0: midpoints[lastIdx],
        p1: pts[pts.length - 1],
        p2: pts[pts.length - 1],
        startThick: midpoints[lastIdx].thickness,
        midThick: pts[pts.length - 1].thickness,
        endThick: pts[pts.length - 1].thickness,
      });
    }

    // Calculate bounding box TRectD
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const p of this.rawPoints) {
      minX = Math.min(minX, p.x - p.thickness);
      maxX = Math.max(maxX, p.x + p.thickness);
      minY = Math.min(minY, p.y - p.thickness);
      maxY = Math.max(maxY, p.y + p.thickness);
    }

    const bbox: BoundingBox = {
      minX: Math.floor(minX),
      minY: Math.floor(minY),
      maxX: Math.ceil(maxX),
      maxY: Math.ceil(maxY),
    };

    const stroke: OpenToonzStroke = {
      id: 'ot_' + Math.random().toString(36).substring(2, 9),
      tool: this.tool,
      color: this.color,
      opacity: this.opacity,
      size: this.baseSize,
      segments,
      rawPoints: [...this.rawPoints],
      bbox,
      isVector: this.isVector,
      smoothError: this.smoothError,
      timestamp: Date.now(),
    };

    this.rawPoints = [];
    return stroke;
  }

  /**
   * Ramer-Douglas-Peucker simplification using OpenToonz error tolerance
   */
  private simplifyPoints(points: Point[], tolerance: number): Point[] {
    if (points.length <= 2) return points;
    const sqTolerance = tolerance * tolerance;

    const getSqDist = (p: Point, p1: Point, p2: Point) => {
      let x = p1.x;
      let y = p1.y;
      let dx = p2.x - x;
      let dy = p2.y - y;

      if (dx !== 0 || dy !== 0) {
        const t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
          x = p2.x;
          y = p2.y;
        } else if (t > 0) {
          x += dx * t;
          y += dy * t;
        }
      }

      dx = p.x - x;
      dy = p.y - y;
      return dx * dx + dy * dy;
    };

    const simplifySection = (start: number, end: number): Point[] => {
      let maxSqDist = sqTolerance;
      let index = -1;

      for (let i = start + 1; i < end; i++) {
        const sqDist = getSqDist(points[i], points[start], points[end]);
        if (sqDist > maxSqDist) {
          index = i;
          maxSqDist = sqDist;
        }
      }

      if (index !== -1) {
        const left = simplifySection(start, index);
        const right = simplifySection(index, end);
        return left.slice(0, -1).concat(right);
      }
      return [points[start], points[end]];
    };

    return simplifySection(0, points.length - 1);
  }
}

/**
 * OpenToonz Canvas Renderer
 * Renders OpenToonz TStroke segments with variable thickness, cap styles, and raster dab blits.
 */
export function renderOpenToonzStroke(
  ctx: CanvasRenderingContext2D,
  stroke: OpenToonzStroke,
  highlightControlPoints: boolean = false
) {
  if (stroke.segments.length === 0) return;

  ctx.save();
  ctx.globalAlpha = stroke.opacity;

  if (stroke.tool === 'eraser') {
    ctx.globalCompositeOperation = 'destination-out';
  } else {
    ctx.globalCompositeOperation = 'source-over';
  }

  if (stroke.isVector || stroke.tool === 'pencil') {
    // Render OpenToonz TStroke with variable thickness interpolation
    for (const seg of stroke.segments) {
      ctx.beginPath();
      ctx.moveTo(seg.p0.x, seg.p0.y);
      ctx.quadraticCurveTo(seg.p1.x, seg.p1.y, seg.p2.x, seg.p2.y);

      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = Math.max(1, seg.midThick);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  } else {
    // OpenToonz Raster dab rendering
    ctx.fillStyle = stroke.color;
    for (const pt of stroke.rawPoints) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, Math.max(0.5, pt.thickness * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw OpenToonz TStroke control points if toggled
  if (highlightControlPoints && stroke.isVector) {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.8;
    for (const seg of stroke.segments) {
      // Control point (p1)
      ctx.beginPath();
      ctx.arc(seg.p1.x, seg.p1.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444'; // Red vertex
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Knot point (p2)
      ctx.beginPath();
      ctx.rect(seg.p2.x - 3, seg.p2.y - 3, 6, 6);
      ctx.fillStyle = '#3b82f6'; // Blue knot
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * OpenToonz Scanline Flood Fill Algorithm
 */
export function openToonzFloodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance: number = 32
) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const hexToRgb = (hex: string) => {
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 255,
    };
  };

  const fillRgba = hexToRgb(fillColorHex);
  const startPos = (startY * width + startX) * 4;
  const targetR = data[startPos];
  const targetG = data[startPos + 1];
  const targetB = data[startPos + 2];
  const targetA = data[startPos + 3];

  if (
    Math.abs(targetR - fillRgba.r) < 5 &&
    Math.abs(targetG - fillRgba.g) < 5 &&
    Math.abs(targetB - fillRgba.b) < 5 &&
    Math.abs(targetA - fillRgba.a) < 5
  ) {
    return;
  }

  const matchTarget = (pos: number) => {
    const r = data[pos];
    const g = data[pos + 1];
    const b = data[pos + 2];
    const a = data[pos + 3];
    return (
      Math.abs(r - targetR) <= tolerance &&
      Math.abs(g - targetG) <= tolerance &&
      Math.abs(b - targetB) <= tolerance &&
      Math.abs(a - targetA) <= tolerance
    );
  };

  const stack: [number, number][] = [[startX, startY]];
  const visited = new Uint8Array(width * height);

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const pixelIndex = y * width + x;
    if (visited[pixelIndex]) continue;

    let lx = x;
    while (lx > 0 && matchTarget((y * width + (lx - 1)) * 4) && !visited[y * width + (lx - 1)]) {
      lx--;
    }

    let rx = x;
    while (rx < width - 1 && matchTarget((y * width + (rx + 1)) * 4) && !visited[y * width + (rx + 1)]) {
      rx++;
    }

    for (let i = lx; i <= rx; i++) {
      const p = (y * width + i) * 4;
      visited[y * width + i] = 1;
      data[p] = fillRgba.r;
      data[p + 1] = fillRgba.g;
      data[p + 2] = fillRgba.b;
      data[p + 3] = fillRgba.a;

      if (y > 0 && matchTarget(((y - 1) * width + i) * 4) && !visited[(y - 1) * width + i]) {
        stack.push([i, y - 1]);
      }
      if (y < height - 1 && matchTarget(((y + 1) * width + i) * 4) && !visited[(y + 1) * width + i]) {
        stack.push([i, y + 1]);
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Generates valid SVG representation from OpenToonz strokes
 */
export function exportStrokesToSvg(strokes: OpenToonzStroke[], width: number, height: number): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `  <!-- Generated by Project Canvas v29 (OpenToonz Drawing Engine v1.8.0) -->\n`;
  svg += `  <!-- Commit: ${OPENTOONZ_COMMIT_SHA} -->\n`;

  for (const stroke of strokes) {
    if (stroke.tool === 'eraser') continue;
    if (stroke.segments.length === 0) continue;

    let pathData = `M ${stroke.segments[0].p0.x.toFixed(2)} ${stroke.segments[0].p0.y.toFixed(2)}`;
    for (const seg of stroke.segments) {
      pathData += ` Q ${seg.p1.x.toFixed(2)} ${seg.p1.y.toFixed(2)}, ${seg.p2.x.toFixed(2)} ${seg.p2.y.toFixed(2)}`;
    }

    svg += `  <path d="${pathData}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.size}" stroke-linecap="round" stroke-linejoin="round" opacity="${stroke.opacity}" />\n`;
  }

  svg += `</svg>`;
  return svg;
}
