import { parse } from 'exifr';
import type { PhotoAnalysis, Row } from '@/types/photo';

const pad = (n: number) => String(n).padStart(2, '0');

export const fmtDate = (d: unknown): string =>
  d instanceof Date && !isNaN(d.getTime())
    ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    : d ? String(d) : '';

const num = (v: unknown, dec: number): string | number | undefined =>
  typeof v === 'number' ? v.toFixed(dec) : (v as string | number | undefined);

export function dms(deg: number, pos: string, neg: string): string {
  const dir = deg >= 0 ? pos : neg;
  deg = Math.abs(deg);
  const d = Math.floor(deg), m = Math.floor((deg - d) * 60);
  const s = ((deg - d - m / 60) * 3600).toFixed(1);
  return `${d}°${m}′${s}″ ${dir}`;
}

export function isValidCoord(lat: unknown, lng: unknown): boolean {
  return typeof lat === 'number' && typeof lng === 'number' &&
    isFinite(lat) && isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

export function decimalCoord(lat: number, lng: number): string {
  return `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lng).toFixed(4)}° ${lng >= 0 ? 'E' : 'W'}`;
}

export function dmsCoord(lat: number, lng: number): string {
  return `${dms(lat, 'N', 'S')} · ${dms(lng, 'E', 'W')}`;
}

function loadDimensions(url: string): Promise<string | null> {
  return new Promise(res => {
    const im = new Image();
    im.onload = () => res(`${im.naturalWidth} × ${im.naturalHeight}`);
    im.onerror = () => res(null);
    im.src = url;
  });
}

// Returns null when the image cannot be decoded at all.
export async function analyzeImage(file: File, url: string): Promise<PhotoAnalysis | null> {
  const dim = await loadDimensions(url);
  if (dim === null) return null;

  let data: Record<string, any> | null = null;
  try {
    data = await parse(file, {
      tiff: true, exif: true, gps: true, ifd0: true, ifd1: false,
      xmp: true, iptc: true, icc: false, jfif: true,
      translateKeys: true, translateValues: true, reviveValues: true,
      mergeOutput: true
    } as unknown as Parameters<typeof parse>[1]);
  } catch (e) { console.warn(e); }
  data = data || {};

  const hasGPS = isValidCoord(data.latitude, data.longitude);
  const copyright = data.Copyright || data.copyright || data.rights;
  const seo = data.ImageDescription || data.title || data.description || data.Keywords || data.subject || data.Caption;
  const optimized = file.size <= 3 * 1024 * 1024;

  const checks = [
    { label: 'GPS LOCATION', ok: hasGPS },
    { label: 'COPYRIGHT', ok: !!copyright },
    { label: 'SEO & INDEXING', ok: !!seo },
    { label: 'OPTIMIZED', ok: optimized },
  ];
  const score = checks.filter(c => c.ok).length * 25;

  const created = data.DateTimeOriginal || data.CreateDate;
  const summaryRows: Row[] = [
    ['NAME', file.name],
    ['SIZE', (file.size / 1048576).toFixed(2) + ' MB'],
    ['TYPE', file.type || 'tidak diketahui'],
    ['DIMENSIONS', dim],
    ['DATE', created ? fmtDate(created) + ' (waktu kamera)' : ''],
  ];

  const exifRows: Row[] = [
    ['Created', fmtDate(data.DateTimeOriginal || data.CreateDate)],
    ['Modified', fmtDate(data.ModifyDate)],
    ['Orientation', data.Orientation],
    ['Color space', data.ColorSpace],
    ['Software', data.Software],
    ['Camera make', data.Make],
    ['Camera model', data.Model],
    ['Lens', data.LensModel],
    ['Focal length (mm)', num(data.FocalLength, 4)],
    ['Focal length (35mm equiv.)', data.FocalLengthIn35mmFormat],
    ['Aperture (f-number)', num(data.FNumber, 4)],
    ['Shutter speed (s)', num(data.ExposureTime, 4)],
    ['ISO', data.ISO],
    ['Flash', data.Flash],
    ['White balance', data.WhiteBalance],
    ['Exposure mode', data.ExposureMode],
    ['Metering mode', data.MeteringMode],
    ['Latitude (decimal)', hasGPS ? (data.latitude as number).toFixed(4) : ''],
    ['Longitude (decimal)', hasGPS ? (data.longitude as number).toFixed(4) : ''],
    ['Altitude (m)', data.GPSAltitude !== undefined ? Math.round(data.GPSAltitude) : ''],
  ];

  const rawRows: Row[] = Object.entries(data).map(([k, v]): Row => {
    if (v instanceof Date) return [k, fmtDate(v)];
    if (v instanceof Uint8Array || ArrayBuffer.isView(v)) return [k, `[binary ${(v as Uint8Array).length} byte]`];
    if (typeof v === 'object') return [k, JSON.stringify(v)];
    return [k, v];
  });

  return {
    name: file.name,
    summaryRows,
    exifRows,
    rawRows,
    checks,
    score,
    hasMetadata: Object.keys(data).length > 0,
    hasGPS,
    lat: hasGPS ? data.latitude : 0,
    lng: hasGPS ? data.longitude : 0,
    alt: data.GPSAltitude !== undefined ? Math.round(data.GPSAltitude) : null,
  };
}
