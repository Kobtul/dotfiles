#!/bin/bash
set -euxo pipefail

echo
echo "### INSTALL GUI APPS ###"
source ~/.profile

test -w /opt/nanobrew || sudo "$(mise which nb)" init
nb telemetry off
nb install --cask \
  arc \
  deskpad \
  ghostty \
  gimp \
  heynote \
  inkscape \
  karabiner-elements \
  keepingyouawake \
  mac-mouse-fix \
  meetingbar \
  mitmproxy \
  monitorcontrol \
  zed || true
