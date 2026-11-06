# Dotfiles

Managed with [mise bootstrap](https://mise.jdx.dev/bootstrap.html).

Bootstrap with:

```sh
# Linux: install git first
curl https://mise.run | sh
~/.local/bin/mise bootstrap --adopt Kobtul/dotfiles --yes
```

## Agent skills

The skills in `home/.agents/skills/` go to `~/.agents/skills` (Codex, OpenCode)
and to `~/.claude/skills` (Claude Code).

| Skill | What it does | Source |
| --- | --- | --- |
| [`align`](home/.agents/skills/align/SKILL.md) | Checks that the agent and the user agree on the task before work starts | Own |
| [`handoff`](home/.agents/skills/handoff/SKILL.md) | Writes a continuation note for a fresh session | Own |
| [`review-changes`](home/.agents/skills/review-changes/SKILL.md) | Reviews the branch and the uncommitted files of one repo. It first checks that the problem exists on the base and that the change is necessary, then compares behaviour on the base and the head, then reviews design, the runtime cost, tests, and style. [`checklist.md`](home/.agents/skills/review-changes/checklist.md) holds the rules, in four levels | Own |
| [`unslop`](home/.agents/skills/unslop/SKILL.md) | Removes AI patterns from text. Start it with `/unslop` | [`cursor/plugins`](https://github.com/cursor/plugins/blob/main/pstack/skills/unslop/SKILL.md), `pstack/skills/unslop` |
| [`find-docs`](home/.agents/skills/find-docs/SKILL.md) | Fetches current library documentation with the Context7 CLI, `npx ctx7@latest` | Installed by the Context7 CLI |
| [`adk-docs`](home/.agents/skills/adk-docs/SKILL.md) | Fetches the official Google ADK documentation | Own |
| [`mlflow`](home/.agents/skills/mlflow/SKILL.md) | Reads and changes MLflow experiments, runs, and traces with the MLflow CLI. The default server is `http://127.0.0.1:5000` | Own |
| [`markdown-to-html`](home/.agents/skills/markdown-to-html/SKILL.md) | Converts Markdown to HTML, with Mermaid diagrams as local PNG images | Own |

| Tool | Needed by |
| --- | --- |
| Git | `review-changes` |
| Node.js and `npx` | `find-docs`, `markdown-to-html` |
| Mermaid CLI in npm's global folder: `npm install -g @mermaid-js/mermaid-cli` | `markdown-to-html`. It finds the CLI's Markdown parser through `npm root -g` |
| `uv` (`uvx`) | `mlflow` |

Checks:

```sh
node home/.agents/skills/markdown-to-html/test-convert.mjs
```
