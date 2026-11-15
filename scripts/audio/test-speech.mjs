// CI smoke test: speechSynthesis remains the fallback when no recorded MP3 exists.
import { build } from 'esbuild';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const spoken = [];
const native = {
  getVoices: () => [{ lang: 'ko-KR', name: 'native-korean' }],
  addEventListener: () => {},
  cancel: () => {},
  speak: utterance => {
    spoken.push(utterance);
    utterance.onstart?.();
    utterance.onend?.();
  },
};
globalThis.window = { speechSynthesis: native, setTimeout, clearTimeout };
globalThis.document = { querySelectorAll: () => [] };
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; }
};
globalThis.fetch = async () => ({ ok: true, json: async () => ({ version: 1, languages: {}, entries: {} }) });
const result = await build({
  entryPoints: ['src/lib/speech.ts'], bundle: true, platform: 'browser',
  format: 'esm', write: false, target: 'es2022', logLevel: 'silent',
  define: { 'import.meta.env.BASE_URL': JSON.stringify('/eommamal/') },
});
const mod = await import('data:text/javascript;base64,' +
  Buffer.from(result.outputFiles[0].contents).toString('base64'));
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(mod.hasVoice('ko-KR'), true);
assert.equal(mod.hasVoice('mn-MN'), false);
assert.equal(mod.speechSupported(), true);
assert.deepEqual(mod.wordStarts('hello world'), [0, 6]);
let ended = 0;
let completed = 0;
assert.equal(mod.speak([{ text: '안녕하세요', lang: 'ko-KR', onDone: () => completed++ }], () => ended++), true);
assert.equal(spoken.length, 1);
assert.equal(spoken[0].text, '안녕하세요');
assert.equal(spoken[0].lang, 'ko-KR');
assert.equal(completed, 1);
assert.equal(ended, 1);
const text = '몽골의 문장';
const expected = createHash('sha256').update(text.normalize('NFC').trim()).digest('hex');
// audioHash is deliberately nonexported from speech; verify it through its source.
const hashBuild = await build({
  entryPoints: ['src/lib/audioHash.ts'], bundle: true, platform: 'node',
  format: 'esm', write: false, logLevel: 'silent',
});
const hashMod = await import('data:text/javascript;base64,' +
  Buffer.from(hashBuild.outputFiles[0].contents).toString('base64'));
assert.equal(hashMod.audioHash(text), expected);
assert.equal(hashMod.audioHash('  cafe\u0301  '), createHash('sha256').update('café').digest('hex'));
console.log('Speech fallback and hash smoke tests passed.');
