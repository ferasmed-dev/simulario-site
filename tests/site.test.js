// Static checks for the landing page: run with `node --test`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = { es: 'index.html', en: 'en/index.html' };
const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const html = Object.fromEntries(Object.entries(PAGES).map(([l, p]) => [l, read(p)]));

const localRefs = (page, src) => {
  const out = [];
  for (const m of src.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const u = m[1];
    if (/^(https?:|mailto:|data:)/.test(u)) continue;
    out.push(normalize(join(dirname(page), u)));
  }
  return out;
};

test('every local file a page points to exists', () => {
  for (const [lang, page] of Object.entries(PAGES)) {
    for (const ref of localRefs(page, html[lang])) {
      const p = join(ROOT, ref);
      const target = ref.endsWith('/') || ref === '.' || ref === '..' ? join(p, 'index.html') : p;
      assert.ok(existsSync(target), `${page} → ${ref} is missing`);
    }
  }
});

test('both languages have the same structure', () => {
  const ids = (s) => [...s.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids(html.es), ids(html.en));
  for (const lang of ['es', 'en']) {
    assert.equal((html[lang].match(/class="wtab[ "]/g) || []).length, 4, `${lang}: 4 showcase tabs`);
    assert.equal((html[lang].match(/class="wslide"/g) || []).length, 4, `${lang}: 4 showcase slides`);
    assert.equal((html[lang].match(/class="fr( on)?"/g) || []).length, 38, `${lang}: 38 frames`);
    assert.equal((html[lang].match(/class="fr on"/g) || []).length, 4, `${lang}: first frame of each slide visible`);
  }
});

test('language attributes and alternates are set', () => {
  assert.match(html.es, /<html lang="es">/);
  assert.match(html.en, /<html lang="en">/);
  for (const s of Object.values(html)) {
    assert.match(s, /hreflang="es"/);
    assert.match(s, /hreflang="en"/);
  }
  assert.match(html.es, /href="en\/"/, 'ES page links to the English page');
  assert.match(html.en, /href="\.\.\/"/, 'EN page links back to Spanish');
});

test('no leftovers from the design canvas', () => {
  for (const s of Object.values(html)) {
    for (const bad of ['{{', '/_blob/', '.dc.html', 'sc-if', 'support.js', 'Tema ', 'SobreValiente']) {
      assert.ok(!s.includes(bad), `found "${bad}"`);
    }
  }
});

test('showcase script parses and every image has dimensions', () => {
  new vm.Script(read('src/main.js'));
  for (const s of Object.values(html)) {
    for (const m of s.matchAll(/<img [^>]*>/g)) assert.match(m[0], /\salt="/, 'img without alt');
    for (const m of s.matchAll(/<img class="fr[^>]*>/g)) assert.match(m[0], /width="1280" height="800"/);
  }
});
