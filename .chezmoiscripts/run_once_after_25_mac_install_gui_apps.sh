#!/bin/bash
set -euxo pipefail

echo
echo "### INSTALL GUI APPS ###"
source ~/.profile

brew install --cask --adopt \
  arc \
  bettercapture \
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
  temurin \
  zed || true
