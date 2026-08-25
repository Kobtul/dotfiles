#!/bin/bash
set -euxo pipefail

echo
echo "### INSTALL GUI APPS ###"
source ~/.profile

brew install --cask --adopt \
  arc \
  bettercapture \
  chatgpt \
  deskpad \
  ghostty \
  gimp \
  heynote \
  inkscape \
  karabiner-elements \
  mac-mouse-fix \
  meetingbar \
  mitmproxy \
  monitorcontrol \
  opencode-desktop \
  temurin \
  zed \
  zen || true
