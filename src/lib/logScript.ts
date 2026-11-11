import type { Stage } from '@/types/photo';

export type LogTag = 'OK' | '..' | 'WARN' | 'INFO';

export interface LogEntry {
  tag: LogTag;
  text: string;
}

const processing: LogEntry[] = [
  { tag: 'OK', text: 'Buffer diverifikasi, 0 segmen rusak' },
  { tag: '..', text: 'Membuka lapisan 1/5: container JPEG' },
  { tag: 'OK', text: 'LAYER 1/5 BYPASSED' },
  { tag: '..', text: 'Membaca marker SOI / APP0 / APP1' },
  { tag: 'INFO', text: 'Segmen APP1 terdeteksi (Exif)' },
  { tag: 'OK', text: 'LAYER 2/5 BYPASSED' },
  { tag: '..', text: 'Menelusuri IFD0 pointer' },
  { tag: 'WARN', text: 'Tag vendor tidak dikenal, dilewati' },
  { tag: '..', text: 'HEADER ANALYSIS: memindai 0x0000 - 0x03FF' },
  { tag: 'INFO', text: 'Byte signature 0xFF 0xD8 0xFF cocok' },
  { tag: 'OK', text: 'LAYER 3/5 BYPASSED' },
  { tag: '..', text: 'Mendekode tabel Huffman' },
  { tag: 'INFO', text: 'Quantization table ditemukan' },
  { tag: 'WARN', text: 'Checksum XMP tidak sesuai, mencoba ulang' },
  { tag: 'OK', text: 'Checksum XMP valid pada percobaan kedua' },
  { tag: '..', text: 'Memetakan pixel cluster 0/64' },
  { tag: '..', text: 'DECRYPTING: menyusun kunci IFD' },
  { tag: 'INFO', text: 'Kunci parsial diperoleh (24 bit)' },
  { tag: 'OK', text: 'LAYER 4/5 BYPASSED' },
  { tag: '..', text: 'Membaca blok IPTC dan kata kunci' },
  { tag: 'INFO', text: 'Entri IPTC: 6 record ditemukan' },
  { tag: 'WARN', text: 'Encoding karakter tidak standar, normalisasi' },
  { tag: 'OK', text: 'Teks deskripsi dinormalisasi' },
  { tag: '..', text: 'LOCATING GPS IFD: mencari pointer GPSInfo' },
  { tag: 'INFO', text: 'GPS IFD pointer ditemukan di offset tersembunyi' },
  { tag: '..', text: 'TRIANGULATING: menghitung ulang sudut lintang' },
  { tag: 'OK', text: 'LAYER 5/5 BYPASSED' },
  { tag: '..', text: 'Verifikasi integritas data akhir' },
  { tag: 'OK', text: 'Integritas data terverifikasi' },
  { tag: 'INFO', text: 'Menyiapkan lapisan presentasi' },
];

const scanning: LogEntry[] = [
  { tag: 'OK', text: 'Sumber gambar diterima' },
  { tag: '..', text: 'LOADING IMAGE BUFFER...' },
  { tag: 'INFO', text: 'Mengalokasikan buffer lokal (browser only)' },
  { tag: '..', text: 'INITIALIZING SCANNER...' },
  { tag: '..', text: 'ANALYZING IMAGE STRUCTURE...' },
  { tag: 'OK', text: 'Pemindaian selesai, memulai proses' },
];

const reveal: LogEntry[] = [
  { tag: 'OK', text: 'Menyusun ringkasan citra' },
  { tag: 'INFO', text: 'Field metadata siap ditampilkan' },
  { tag: '..', text: 'Membuka panel data' },
  { tag: 'OK', text: 'Data tervalidasi' },
];

const gps: LogEntry[] = [
  { tag: '..', text: 'Mencari koordinat GPS pada IFD' },
  { tag: 'INFO', text: 'Radar sweep aktif' },
  { tag: '..', text: 'Menghitung triangulasi' },
  { tag: 'OK', text: 'TRIANGULATION COMPLETE' },
  { tag: '..', text: 'LOCKING TARGET...' },
];

const result: LogEntry[] = [
  { tag: 'OK', text: 'Analisis selesai' },
];

const error: LogEntry[] = [
  { tag: 'WARN', text: 'Proses dihentikan' },
  { tag: 'WARN', text: 'Input tidak dapat diproses' },
];

export const LOG_SCRIPT: Record<Stage, LogEntry[]> = {
  idle: [
    { tag: 'INFO', text: 'SYSTEM READY' },
    { tag: 'INFO', text: 'Modul ekstraksi metadata dimuat' },
    { tag: 'OK', text: 'Pemrosesan lokal aktif, tidak ada upload' },
    { tag: '..', text: 'AWAITING TARGET IMAGE...' },
  ],
  scanning,
  processing,
  reveal,
  gps,
  flash: [],
  result,
  error,
};
