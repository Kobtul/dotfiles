import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = mkdtempSync(join(tmpdir(), 'markdown-to-html-check-'));
const converter = fileURLToPath(new URL('./convert.mjs', import.meta.url));
const input = join(directory, 'design & notes.md');
try {
  const source = '# Design <review> & notes\n\nText with `inline_code` and [relative link](details.md).\n\n| Key | Value |\n| --- | --- |\n| A | First<br/>second |\n\n- [ ] Pending\n- [x] Done\n\n````text\n::: mermaid\ngraph LR; Example --> Literal\n:::\n```mermaid\nnot a diagram\n```\n````\n\n::: mermaid\ngraph LR; A[Input] --> B[Output]\n:::\n\nAfter the diagram, `still_code`.\n\n~~~mermaid\nsequenceDiagram\n  Alice->>Bob: Hello\n~~~\n';
  writeFileSync(input, source.replaceAll('\n', '\r\n'));
  let run = spawnSync(process.execPath, [converter, input], { encoding: 'utf8', timeout: 300000 });
  assert.equal(run.status, 0, run.stderr);
  const output = join(directory, 'design & notes.html');
  const html = readFileSync(output, 'utf8');
  assert(html.includes('<title>Design &lt;review&gt; &amp; notes</title>'));
  assert(html.includes('<thead>') && !html.includes('scope="col"ead'));
  assert(html.includes('href="details.md"') && html.includes('<code>still_code</code>'));
  assert(html.includes('☐') && html.includes('☑') && !html.includes('<input'));
  assert(html.includes('::: mermaid') && html.includes('not a diagram'));
  assert.equal((html.match(/<img /g) || []).length, 2);
  const pngs = [...html.matchAll(/<img src="([^"]+)"/g)].map(match => join(directory, decodeURIComponent(match[1])));
  const images = pngs.map(path => readFileSync(path));
  for (const image of images) assert(image.readUInt32BE(16) > 0 && image.readUInt32BE(20) > 0);
  run = spawnSync(process.execPath, [converter, input], { encoding: 'utf8' });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /Refusing to overwrite/);
  writeFileSync(input, '# Broken\n\n```mermaid\nthis is not a valid diagram\n```\n');
  run = spawnSync(process.execPath, [converter, input, '--force'], { encoding: 'utf8', timeout: 150000 });
  assert.notEqual(run.status, 0);
  assert.equal(readFileSync(output, 'utf8'), html);
  pngs.forEach((path, i) => assert.deepEqual(readFileSync(path), images[i]));
  writeFileSync(input, '# Plain\n\nNo diagrams; `literal`.\n');
  run = spawnSync(process.execPath, [converter, input, '--force'], { encoding: 'utf8' });
  assert.equal(run.status, 0, run.stderr);
  assert(!readFileSync(output, 'utf8').includes('<img'));
  assert.equal(readdirSync(directory).filter(name => name.endsWith('.png')).length, 2);
  assert(!readdirSync(directory).some(name => name.startsWith('.markdown-to-html-')));
  console.log('PASS: real flowchart/sequence PNGs, CRLF and Wiki/fenced blocks, literal code, tables, links, checklists, overwrite protection, failed-render preservation and no-diagram conversion.');
} finally {
  rmSync(directory, { recursive: true, force: true });
}
