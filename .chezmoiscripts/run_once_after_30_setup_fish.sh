#!/bin/bash
set -euxo pipefail

echo
echo "### SETUP FISH ###"
set +u
source ~/.profile
set -u
fish_path="$(command -v fish)"
grep -qxF "$fish_path" /etc/shells || echo "$fish_path" | sudo tee -a /etc/shells
chsh -s "$fish_path"
