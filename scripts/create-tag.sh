#!/bin/bash

new_version=$(jq -r '.version' package.json)

new_tag=$new_version

if git rev-parse "$new_tag" >/dev/null 2>&1; then
  echo "Tag $new_tag already exists. Skipping tag creation."
else
  git tag $new_tag
  git push origin $new_tag
  echo "Created new tag: $new_tag"
fi