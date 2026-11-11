export type Row = [label: string, value: string | number | null | undefined];

export interface HealthCheck {
  label: string;
  ok: boolean;
}

export interface PhotoAnalysis {
  name: string;
  summaryRows: Row[];
  exifRows: Row[];
  rawRows: Row[];
  checks: HealthCheck[];
  score: number;
  hasMetadata: boolean;
  hasGPS: boolean;
  lat: number;
  lng: number;
  alt: number | null;
}

export type Stage =
  | 'idle'
  | 'scanning'
  | 'processing'
  | 'reveal'
  | 'gps'
  | 'flash'
  | 'result'
  | 'error';

export type ErrorCode = 'NOT_IMAGE' | 'UNREADABLE' | 'NO_METADATA';
