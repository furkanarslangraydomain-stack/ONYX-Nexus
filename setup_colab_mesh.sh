#!/usr/bin/env bash
# ONYX-Nexus single-cell Colab SSH launcher.
# Mesh and multi-port startup are intentionally removed.
set -euo pipefail

REPO_URL="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git"
TARGET_DIR="${TARGET_DIR:-/content/ONYX-Nexus}"

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  git clone --depth=1 "$REPO_URL" "$TARGET_DIR"
fi

cd "$TARGET_DIR"
python3 -m pip install -q -r requirements.txt
exec python3 colab_single_cell_setup.py
