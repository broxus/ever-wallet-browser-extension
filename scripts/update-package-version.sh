#!/bin/bash

version_type=${1:-patch}
current_version=$(jq -r '.version' src/manifest/base.json)

increment_patch_version() {
  local version=$1
  local type=$2

  local major=$(echo $version | cut -d. -f1)
  local minor=$(echo $version | cut -d. -f2)
  local patch=$(echo $version | cut -d. -f3)


  case "$type" in
    patch)
      patch=$((patch + 1))
      ;;
    minor)
      minor=$((minor + 1))
      patch=0
      ;;
    major)
      major=$((major + 1))
      minor=0
      patch=0
      ;;
    *)
      echo "Unknown version type: $type"
      exit 1
      ;;
  esac

  echo "${major}.${minor}.${patch}"
}

new_version=$(increment_patch_version $current_version $version_type)

jq --arg new_version "$new_version" '.version = $new_version' package.json > package.tmp.json && mv package.tmp.json package.json
jq --arg new_version "$new_version" '.version = $new_version' src/manifest/base.json > src/manifest/base.tmp.json && mv src/manifest/base.tmp.json src/manifest/base.json
jq --arg new_version "$new_version" '.version = $new_version' src/manifest/firefox.json > src/manifest/firefox.tmp.json && mv src/manifest/firefox.tmp.json src/manifest/firefox.json

git add package.json src/manifest/base.json src/manifest/firefox.json
git commit -m "Release new version $new_version"
git push origin $CI_COMMIT_REF_NAME

echo "Updated package version to $new_version"
