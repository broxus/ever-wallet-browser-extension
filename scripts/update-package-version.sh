#!/bin/bash

current_version=$(jq -r '.version' package.json)

increment_patch_version() {
  local version=$1
  local major=$(echo $version | cut -d. -f1)
  local minor=$(echo $version | cut -d. -f2)
  local patch=$(echo $version | cut -d. -f3)
  patch=$((patch + 1))
  echo "${major}.${minor}.${patch}"
}

new_version=$(increment_patch_version $current_version)

jq --arg new_version "$new_version" '.version = $new_version' package.json > package.tmp.json && mv package.tmp.json package.json

echo "Updated package version to $new_version"