---
name: markdown-to-html
description: Convert Markdown documents to browser-viewable HTML with Mermaid diagrams rendered as local PNG images. Use for document exports, including repeatable regeneration and rendering checks.
---

# Markdown to HTML

Use the supporting [converter](convert.mjs), rather than creating another one-off
converter. Preserve the source document's content and diagram semantics.

## Run

```bash
mise exec -- node <skill dir>/convert.mjs "path/to/document.md"
```

Outputs beside the source:

- `document.html`
- `document.mermaid-1.png`, `document.mermaid-2.png`, etc., in document order
- No PNGs for documents without Mermaid

Use `--force` only when the user requests replacement/regeneration of these
outputs. Existing files otherwise cause an error. Source Markdown is never
overwritten. Extra PNGs from a previous, longer document are retained; identify
them for the user rather than deleting them automatically.

The converter supports ordinary fenced Mermaid blocks (backticks or tildes) and
Azure Wiki `::: mermaid` blocks. Headings, tables, inline code, ordinary code
blocks and links use the installed Markdown parser. Checklists become static
checkbox symbols. Mermaid direction and labels are preserved, with a neutral
theme and white background. No browser-side Mermaid script or CDN is required.

## Dependencies and boundaries

- Use installed Node/npm, `mmdc` and its configured browser. This environment uses
  mise; do not use the obsolete nvm path.
- Reuse `marked` from the global Mermaid CLI installation. This is a transitive
  dependency, so a future CLI update may remove it; report the missing dependency
  and ask before installing anything.
- Never run automatic installs, browser downloads or remote diagram-rendering
  services. Rendering uses one job, scale 1, and a two-minute timeout per diagram.
- Process user-selected, reviewed Markdown. Raw HTML and existing URLs are
  preserved; this is a document converter, not an HTML sanitizer. Review raw HTML
  and remote references before opening unfamiliar documents in a browser.
- All diagrams render in a staging directory before publication. Render failures
  leave existing outputs intact. Publication is atomic per file, not across the
  complete HTML/image set; concurrent conversion of the same source is unsupported.
- Output stays beside the source so existing relative links/images keep their
  local meaning. Existing images are referenced, not copied or embedded.

## Verify

1. Check the reported output paths and PNG count. Conversion validates PNG
   signatures and dimensions and checks that no Mermaid code tokens remain.
2. Open the HTML and inspect the generated images. Check label clipping,
   overlapping arrows and readability at the intended display width. Large
   graphs may require full-size viewing. Do not silently change diagram direction
   or rewrite labels; make a presentation copy only when requested.
3. Verify important content, table structure and links against the source. A local
   render does not establish that a publishing platform preserves the result.

After changing the scripts, run the framework-free end-to-end check:

```bash
mise exec -- node <skill dir>/test-convert.mjs
```

The check uses real Mermaid rendering, including flowchart and sequence diagrams,
and verifies failed-render preservation, overwrite protection and literal code.
