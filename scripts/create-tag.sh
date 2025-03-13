#!/bin/bash

latest_tag=$(git describe --tags `git rev-list --tags --max-count=1`)

increment_patch_version() {
  local version=$1
  local major=$(echo $version | cut -d. -f1 | sed 's/tag//')
  local minor=$(echo $version | cut -d. -f2)
  local patch=$(echo $version | cut -d. -f3)
  patch=$((patch + 1))
  echo "tag${major}.${minor}.${patch}"
}

if [ -z "$latest_tag" ]; then
  new_tag="tag0.0.1"
else
  new_tag=$(increment_patch_version $latest_tag)
fi

git tag $new_tag
git push origin $new_tag

echo "Created new tag: $new_tag"