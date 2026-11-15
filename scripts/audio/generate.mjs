/**
 * Azure Speech -> stable public/audio/<lang>/<key>.mp3 with incremental hashing.
 * Run in GitHub Actions only; no Azure key is included in a frontend bundle.
 */
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';

const ROOT = process.cwd();
const AUDIO = join(ROOT, 'public', 'audio');
const MANIFEST = join(AUDIO, 'manifest.json');
const FORMAT = 'audio-24khz-48kbitrate-mono-mp3';
const LANGS = ['ko', 'ru', 'mn', 'vi', 'uz', 'zh', 'en'];
const VOICES = {
  ko: ['ko-KR-SunHiNeural', '-12%'],
  ru: ['ru-RU-SvetlanaNeural', '-10%'],
  mn: ['mn-MN-YesuiNeural', '-10%'],
  vi: ['vi-VN-HoaiMyNeural', '-10%'],
  uz: ['uz-UZ-MadinaNeural', '-10%'],
  zh: ['zh-CN-XiaomoNeural', '-8%'],
  en: ['en-US-JennyNeural', '-10%'],
};
const args = process.argv.slice(2);
const arg = (name, fallback) => {
  const found = args.find(s => s.startsWith('--' + name + '='));
  return found ? found.split('=').slice(1).join('=') : fallback;
};
const dryRun = args.includes('--dry-run');
const force = args.includes('--force');
const scope = arg('scope', 'full');
if (!['full', 'sample'].includes(scope)) throw new Error('Invalid scope');
const selected = arg('languages', 'all') === 'all' ? LANGS :
  arg('languages', 'all').split(',').map(x => x.trim());
if (selected.some(l => !LANGS.includes(l))) throw new Error('Unknown language');
const hash = s => createHash('sha256').update(s).digest('hex');
const normalize = s => s.normalize('NFC').replace(/\r\n?/g, '\n').trim();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const exists = async p => { try { await access(p); return true; } catch { return false; } };

const bundled = await build({
  entryPoints: ['scripts/audio/source.ts'],
  bundle: true, write: false, format: 'esm', platform: 'node', target: 'node20',
  logLevel: 'silent',
});
const mod = await import('data:text/javascript;base64,' +
  Buffer.from(bundled.outputFiles[0].contents).toString('base64'));

const input = [];
// Keep content-pack review entry keys identical. Exclude UI, culture, and story shelf subtitles.
for (const e of mod.entries()) {
  if (!(e.key.startsWith('story.') && (e.key.endsWith('.title') || /\.p\d+$/.test(e.key))) &&
      !e.key.startsWith('word.')) continue;
  for (const lang of selected) {
    const text = lang === 'ko' ? (e.ko ?? e.get('ko')) : e.get(lang);
    if (text && text.trim()) input.push({ lang, key: e.key, text: normalize(text) });
  }
}
// Sentence dictation currently has Korean-only short phrases; do not invent translations.
if (selected.includes('ko')) {
  for (const story of mod.STORIES) {
    (story.phrases ?? []).forEach((phrase, i) => {
      input.push({ lang: 'ko', key: 'sentence.' + story.id + '.p' + (i + 1), text: normalize(phrase.ko) });
    });
  }
}
const ids = new Set();
for (const e of input) {
  const id = e.lang + '/' + e.key;
  if (ids.has(id)) throw new Error('Duplicate audio id: ' + id);
  ids.add(id);
}
const allCount = input.length;
const chosen = scope === 'sample' ? selected.flatMap(lang => input.filter(e => e.lang === lang).slice(0, 2)) : input;
let manifest;
try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')); }
catch { manifest = { version: 1, normalization: 'unicode-nfc-trim-v1', audio: {}, languages: {}, entries: {} }; }
if (manifest.version !== 1) throw new Error('Unknown manifest version');
manifest.audio = { format: FORMAT, sampleRateHz: 24000, channels: 1, bitrateKbps: 48 };
manifest.normalization = 'unicode-nfc-trim-v1';
manifest.languages ??= {};
manifest.entries ??= {};
const pending = [];
for (const item of chosen) {
  const [voice, rate] = VOICES[item.lang];
  const textHash = hash(item.text);
  const settingsHash = hash(JSON.stringify({ voice, rate, format: FORMAT }));
  const filename = item.lang + '/' + item.key + '.mp3';
  const disk = join(AUDIO, filename);
  const old = manifest.entries[item.lang + '/' + item.key];
  if (!force && old?.textHash === textHash && old?.settingsHash === settingsHash &&
      old.file === filename && await exists(disk)) continue;
  pending.push({ ...item, voice, rate, textHash, settingsHash, filename, disk });
}
const charCount = pending.reduce((n, i) => n + [...i.text].length, 0);
console.log(JSON.stringify({
  scope, selected, totalEligible: allCount, selectedItems: chosen.length,
  newOrChanged: pending.length, newOrChangedCharacters: charCount, dryRun
}, null, 2));
if (dryRun) process.exit(0);
if (pending.length && (!process.env.AZURE_SPEECH_KEY || !process.env.AZURE_SPEECH_REGION))
  throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION are required');
const region = process.env.AZURE_SPEECH_REGION;
for (let i = 0; i < pending.length; i++) {
  const it = pending[i];
  const locale = it.voice.split('-').slice(0, 2).join('-');
  const ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="' +
    esc(locale) + '"><voice name="' + esc(it.voice) + '"><prosody rate="' +
    esc(it.rate) + '">' + esc(it.text) + '</prosody></voice></speak>';
  let payload;
  // Limited retries avoid losing prior recordings on transient throttling.
  for (let attempt = 0; attempt < 4; attempt++) {
    const response = await fetch('https://' + region + '.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': FORMAT,
        'User-Agent': 'eommamal-audio-generator',
      },
      body: ssml,
    });
    if (response.ok) { payload = Buffer.from(await response.arrayBuffer()); break; }
    const reason = (await response.text()).slice(0, 200);
    if (attempt === 3 || ![429, 500, 502, 503, 504].includes(response.status))
      throw new Error('Azure Speech ' + response.status + ' on ' + it.lang + '/' + it.key + ': ' + reason);
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt));
  }
  if (!payload?.length) throw new Error('Empty audio response: ' + it.filename);
  await mkdir(dirname(it.disk), { recursive: true });
  await writeFile(it.disk, payload);
  manifest.entries[it.lang + '/' + it.key] = {
    key: it.key, file: it.filename, textHash: it.textHash,
    audioHash: hash(payload), settingsHash: it.settingsHash,
    bytes: payload.length, voice: it.voice, source: 'azure',
  };
  if (i % 25 === 0 || i === pending.length - 1) console.log('Created ' + (i + 1) + '/' + pending.length);
}
// Mark a language complete ONLY when its entire required catalog exists with matching hashes.
for (const lang of selected) {
  const required = input.filter(i => i.lang === lang);
  const complete = required.every(item => {
    const old = manifest.entries[lang + '/' + item.key];
    const [voice, rate] = VOICES[lang];
    return old && old.textHash === hash(item.text) &&
      old.settingsHash === hash(JSON.stringify({ voice, rate, format: FORMAT }));
  });
  manifest.languages[lang] = { complete, count: required.length };
}
await mkdir(AUDIO, { recursive: true });
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log('Manifest updated. Total entries: ' + Object.keys(manifest.entries).length);
