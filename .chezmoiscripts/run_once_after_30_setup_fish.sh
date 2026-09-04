#!/bin/bash
set -euxo pipefail

echo
echo "### SETUP FISH ###"
fish_path="$("$HOME/.local/bin/mise" which fish)"
grep -qxF "$fish_path" /etc/shells || echo "$fish_path" | sudo tee -a /etc/shells
chsh -s "$fish_path"
