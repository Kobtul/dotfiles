#!/bin/bash
set -euxo pipefail

echo
echo "### SETUP FISH ###"
source ~/.profile
fish_path="$(command -v fish)"
grep -qxF "$fish_path" /etc/shells || echo "$fish_path" | sudo tee -a /etc/shells
chsh -s "$fish_path"
