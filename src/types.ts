export interface Point {
  x: number;
  y: number;
  pressure: number;
  thickness: number;
}

export interface QuadSegment {
  p0: Point;
  p1: Point; // OpenToonz control vertex
  p2: Point;
  startThick: number;
  midThick: number;
  endThick: number;
}

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface OpenToonzStroke {
  id: string;
  tool: 'brush' | 'pencil' | 'raster' | 'eraser';
  color: string;
  opacity: number;
  size: number;
  segments: QuadSegment[];
  rawPoints: Point[];
  bbox: BoundingBox;
  isVector: boolean;
  smoothError: number;
  timestamp: number;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  isVector: boolean;
}

export interface Frame {
  id: string;
  frameNumber: number;
  strokesByLayer: Record<string, OpenToonzStroke[]>;
}

export interface BrushPreset {
  id: string;
  name: string;
  tool: 'brush' | 'pencil' | 'raster';
  size: number;
  opacity: number;
  smoothError: number;
  description: string;
}

export interface BuildStep {
  id: number;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'passed' | 'failed';
  details?: string;
  outputPreview?: string;
}

export interface EngineTelemetry {
  totalStrokes: number;
  totalControlPoints: number;
  activeBBox: string;
  memoryBytes: number;
  commitSha: string;
  upstreamLicense: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  fps: number;
  width: number;
  height: number;
  frames: number;
  updated: string;
  backgroundColor?: string;
}

export interface ProjectData extends ProjectSummary {
  layers: Layer[];
  framesList: Frame[];
}
