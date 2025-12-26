#!/bin/bash

set -e

CONFIG_DIR="./src/shared/config"

mkdir -p "$CONFIG_DIR"

for ENV in prod beta; do
  URL="https://raw.githubusercontent.com/broxus/sparx-networks/refs/heads/master/extension_networks_config_${ENV}_v2.json"
  OUT_FILE="$CONFIG_DIR/extension_networks_config_${ENV}.json"
  if ! curl -fsSL "$URL" | jq '.' > "$OUT_FILE"; then
    echo "Error: Failed to download or write $OUT_FILE" >&2
  else
    echo "Downloaded $OUT_FILE"
  fi
done
