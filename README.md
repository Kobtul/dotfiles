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
