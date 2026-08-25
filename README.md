# Dotfiles

Managed with [chezmoi](https://www.chezmoi.io/).

## What's inside

- **Fish shell** config with custom prompt, abbreviations, and keybindings
- **Git** config with aliases and interactive rebase tool
- **Ghostty** terminal config
- **Karabiner Elements** keyboard remapping
- **Homebrew** for CLI tools and macOS graphical apps
- **Mise** for managing Node.js versions
- **uv** for Python versions, projects, and virtual environments
- **Claude Code and OpenCode** with shared global coding instructions
- **Custom scripts** in `~/.local/bin` (e.g. `git-get` for cloning repos into organized paths)
- **JetBrains Mono Nerd Font** auto-installation

## Bootstrap

```sh
BINDIR=~/.local/bin sh -c "$(curl -fsLS get.chezmoi.io)"
~/.local/bin/chezmoi init --branch codex/mac-setup Kobtul
~/.local/bin/chezmoi diff
~/.local/bin/chezmoi apply --dry-run --verbose
~/.local/bin/chezmoi apply
```

## OpenCode

Run `opencode`, then use `/connect` to authenticate a provider and `/models` to select a model. Credentials remain local and are not managed by chezmoi.
