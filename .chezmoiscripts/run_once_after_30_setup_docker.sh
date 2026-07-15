#!/bin/bash
set -euxo pipefail

echo
echo "### SETUP DOCKER ###"

mkdir -p ~/.docker/cli-plugins
ln -sf ~/.local/share/mise/shims/docker-buildx ~/.docker/cli-plugins/docker-buildx
ln -sf ~/.local/share/mise/shims/docker-compose ~/.docker/cli-plugins/docker-compose
