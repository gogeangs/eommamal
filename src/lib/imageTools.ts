// Browser-side picture preparation for the admin screen: resize, flatten and convert to WebP.

function loadImage(file: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('그림 파일을 열 수 없어요.')); };
    img.src = url;
  });
}

const toDataUrl = (c: HTMLCanvasElement, q: number) => {
  const webp = c.toDataURL('image/webp', q);
  return webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/png');
};

/** Story page: 1200×800, transparent areas filled with a backdrop color, cropped to 3:2. */
export async function scenePicture(file: Blob, backdrop: string): Promise<string> {
  const img = await loadImage(file);
  const W = 1200, H = 800;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = backdrop; g.fillRect(0, 0, W, H);
  const s = Math.max(W / img.width, H / img.height);
  const w = img.width * s, h = img.height * s;
  g.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  return toDataUrl(c, 0.82);
}

/** Word icon: square 384px, transparent, trimmed to the drawing with an even margin. */
export async function wordPicture(file: Blob): Promise<string> {
  const img = await loadImage(file);
  const t = document.createElement('canvas'); t.width = img.width; t.height = img.height;
  const tg = t.getContext('2d', { willReadFrequently: true })!;
  tg.drawImage(img, 0, 0);
  const d = tg.getImageData(0, 0, t.width, t.height).data;
  let x0 = t.width, y0 = t.height, x1 = 0, y1 = 0;
  for (let y = 0; y < t.height; y += 2) for (let x = 0; x < t.width; x += 2) {
    if (d[(y * t.width + x) * 4 + 3] > 200) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  }
  if (x1 <= x0) { x0 = 0; y0 = 0; x1 = t.width; y1 = t.height; }
  const bw = x1 - x0, bh = y1 - y0, S = 384, inner = S * 0.84, s = inner / Math.max(bw, bh);
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  c.getContext('2d')!.drawImage(t, x0, y0, bw, bh, (S - bw * s) / 2, (S - bh * s) / 2, bw * s, bh * s);
  return toDataUrl(c, 0.88);
}

/** data: URL → bytes, for packing into a zip. */
export function dataUrlBytes(url: string): { bytes: Uint8Array; ext: string } {
  const [head, b64] = url.split(',');
  const ext = head.includes('image/png') ? 'png' : 'webp';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return { bytes, ext };
}

export function bytesDataUrl(bytes: Uint8Array, ext: string): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:image/${ext === 'png' ? 'png' : 'webp'};base64,${btoa(s)}`;
}
