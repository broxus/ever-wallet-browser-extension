#!/bin/bash

current_version=$(jq -r '.version' src/manifest/base.json)

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
jq --arg new_version "$new_version" '.version = $new_version' src/manifest/base.json > src/manifest/base.tmp.json && mv src/manifest/base.tmp.json src/manifest/base.json
jq --arg new_version "$new_version" '.version = $new_version' src/manifest/firefox.json > src/manifest/firefox.tmp.json && mv src/manifest/firefox.tmp.json src/manifest/firefox.json

git add package.json src/manifest/base.json src/manifest/firefox.json
git commit -m "Release new version $new_version"
git push origin $CI_COMMIT_REF_NAME

echo "Updated package version to $new_version"
