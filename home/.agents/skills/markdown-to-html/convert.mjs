import { execFileSync } from 'node:child_process';
import { lstatSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { force: { type: 'boolean' }, help: { type: 'boolean' } },
  });
  if (values.help) {
    console.log('Usage: node convert.mjs document.md [--force]\nWrites HTML and numbered Mermaid PNGs beside the Markdown. Requires installed npm, marked and mmdc; never installs dependencies.');
    process.exit(0);
  }
  if (positionals.length !== 1) throw new Error('Expected one Markdown path. Use --help for usage.');
  const input = resolve(positionals[0]);
  if (!/\.(md|markdown)$/i.test(input)) throw new Error('Input must end in .md or .markdown.');
  const source = readFileSync(input, 'utf8');
  const directory = dirname(input);
  const stem = basename(input, extname(input));
  const npmRoot = execFileSync('npm', ['root', '-g'], { encoding: 'utf8', timeout: 15000 }).trim();
  // Reuse mmdc's transitive parser; stop if a future CLI release removes it.
  const require = createRequire(join(npmRoot, '@mermaid-js/mermaid-cli/package.json'));
  const { marked } = await import(pathToFileURL(require.resolve('marked')).href);
  marked.use({ extensions: [{
    name: 'mermaidContainer',
    level: 'block',
    start(text) { return text.match(/^ {0,3}:::[ \t]*mermaid[ \t]*\r?$/m)?.index; },
    tokenizer(text) {
      const match = /^ {0,3}:::[ \t]*mermaid[ \t]*\r?\n([\s\S]*?)^ {0,3}:::[ \t]*(?:\r?\n|$)/m.exec(text);
      if (match?.index === 0) return { type: 'code', raw: match[0], lang: 'mermaid', text: match[1] };
      if (/^ {0,3}:::[ \t]*mermaid[ \t]*(?:\r?\n|$)/.test(text)) throw new Error('Unclosed ::: mermaid block.');
    },
  }] });
  const tokens = marked.lexer(source);
  const diagrams = [];
  marked.walkTokens(tokens, token => {
    if (token.type === 'code' && token.lang?.trim().split(/\s+/)[0] === 'mermaid') diagrams.push(token);
    if (token.type === 'list_item' && token.task) {
      token.task = false;
      token.tokens.unshift({ type: 'html', raw: '', text: token.checked ? '☑ ' : '☐ ' });
    }
  });
  const htmlPath = join(directory, `${stem}.html`);
  const imagePaths = diagrams.map((_, i) => join(directory, `${stem}.mermaid-${i + 1}.png`));
  for (const output of [htmlPath, ...imagePaths]) {
    const existing = lstatSync(output, { throwIfNoEntry: false });
    if (existing && (!values.force || !existing.isFile())) throw new Error(`Refusing to overwrite ${output}. Use --force for existing regular output files.`);
  }
  const staging = mkdtempSync(join(directory, '.markdown-to-html-'));
  try {
    for (const [index, token] of diagrams.entries()) {
      const definition = join(staging, `${index}.mmd`);
      const image = join(staging, basename(imagePaths[index]));
      writeFileSync(definition, token.text);
      execFileSync('mmdc', ['-i', definition, '-o', image, '-j', '1', '-t', 'neutral', '-b', 'white', '-w', '2500', '-s', '1'], { timeout: 120000, stdio: 'pipe' });
      const png = readFileSync(image);
      if (!png.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) || png.length < 24 || !png.readUInt32BE(16) || !png.readUInt32BE(20)) throw new Error(`Invalid PNG for diagram ${index + 1}.`);
      token.type = 'html';
      token.text = `<p><img src="${encodeURIComponent(basename(imagePaths[index]))}" alt="Mermaid diagram ${index + 1}" width="1400" style="max-width:100%;height:auto;"></p>\n`;
    }
    marked.walkTokens(tokens, token => {
      if (token.type === 'code' && token.lang === 'mermaid') throw new Error('Unconverted Mermaid block.');
    });
    const body = marked.parser(tokens)
      .replaceAll('<table>', '<table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;border:1px solid #b8c2cc;">')
      .replace(/<th\b/g, '<th scope="col"')
      .replace(/<(td|th)\b([^>]*)>/g, '<$1$2 valign="top">');
    const title = (tokens.find(token => token.type === 'heading')?.text || stem)
      .replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
    writeFileSync(join(staging, basename(htmlPath)), `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
</head>
<body style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;line-height:1.5;color:#24292f;background:#fff;max-width:1400px;margin:24px auto;padding:0 20px;">
${body}</body>
</html>
`);
    // Staging protects existing output from render failures; publication is per-file atomic.
    for (const output of [...imagePaths, htmlPath]) renameSync(join(staging, basename(output)), output);
  } finally {
    rmSync(staging, { recursive: true, force: true });
  }
  console.log([htmlPath, ...imagePaths].join('\n'));
} catch (error) {
  console.error(error.stderr?.toString().trim() || error.message);
  console.error('Conversion stopped. Missing tools must be installed separately with user approval.');
  process.exitCode = 1;
}
