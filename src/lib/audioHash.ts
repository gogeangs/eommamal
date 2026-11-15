/** Shared text normalization for generated recordings and live content-pack overrides. */
export function audioText(text: string): string {
  return text.normalize('NFC').replace(/\r\n?/g, '\n').trim();
}

/** Synchronous SHA-256 keeps audio.play() within the user's tap gesture (important on iOS). */
export function audioHash(text: string): string {
  const bytes = new TextEncoder().encode(audioText(text));
  const primes: number[] = [];
  for (let n = 2; primes.length < 64; n++) {
    if (primes.every(p => n % p !== 0)) primes.push(n);
  }
  const frac = (v: number) => (v - Math.floor(v)) * 0x100000000 >>> 0;
  const h = primes.slice(0, 8).map(p => frac(Math.sqrt(p)));
  const k = primes.map(p => frac(Math.cbrt(p)));
  const length = bytes.length;
  const padded = new Uint8Array(Math.ceil((length + 9) / 64) * 64);
  padded.set(bytes);
  padded[length] = 0x80;
  const bitLength = length * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  const r = (v: number, n: number) => (v >>> n) | (v << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    const w = new Uint32Array(64);
    for (let j = 0; j < 16; j++) w[j] = view.getUint32(off + j * 4, false);
    for (let j = 16; j < 64; j++) {
      const a = w[j - 15], b = w[j - 2];
      w[j] = (w[j - 16] + (r(a, 7) ^ r(a, 18) ^ (a >>> 3)) + w[j - 7] + (r(b, 17) ^ r(b, 19) ^ (b >>> 10))) >>> 0;
    }
    let [a, b, c, d, e, f, g, z] = h;
    for (let j = 0; j < 64; j++) {
      const t1 = (z + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + k[j] + w[j]) >>> 0;
      const t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      z = g; g = f; f = e; e = (d + t1) >>> 0;
      d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    [a,b,c,d,e,f,g,z].forEach((v, i) => { h[i] = (h[i] + v) >>> 0; });
  }
  return h.map(v => v.toString(16).padStart(8, '0')).join('');
}
