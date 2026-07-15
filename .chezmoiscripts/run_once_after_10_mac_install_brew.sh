#!/bin/bash
set -euxo pipefail

echo ""
echo "### INSTALL BREW ###"
test -x /opt/homebrew/bin/brew ||
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
