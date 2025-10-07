#!/bin/bash

tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$tag" ]; then
  version=$(jq .version src/manifest/base.json -r)
  tag="sparx-${version}"
fi

additional_commits=$(git rev-list ${tag}..HEAD --count 2>/dev/null || echo "0")
if [[ "$additional_commits" -gt 0 ]]; then
  tag_name="${tag}.${additional_commits}"
else
  tag_name="${tag}"
fi

while getopts 'v:' flag; do
  case "${flag}" in
    v) variant="${OPTARG}" ;;
    *) exit 1 ;;
  esac
done

commit=$(git rev-parse --short HEAD)
name="${tag_name}-${variant}-${commit}"

mkdir -p release
mkdir -p tmp

if [[ "$variant" == "source" ]]; then
  # Create a source archive of the repository (excluding build/output and IDE folders)
  out_zip="release/source.zip"
  rm -f "$out_zip"
  # Zip everything from project root (current working dir expected to be repo root)
  zip -r "$out_zip" . \
    -x ".vscode/*" \
    -x ".git/*" \
    -x "dist/*" \
    -x "tmp/*" \
    -x "node_modules/*" \
    -x "release/*"
  echo "Packaged source archive: source.zip"
  # Skip the rest of variant handlers
  rm -rf ./tmp
  exit 0
elif [[ "$variant" == "firefox" ]]; then
  cp -r ./dist/* ./tmp/

  cd ./tmp
  zip -r ../release/${name}.zip .
  cd ..
else
  cp -r ./dist ./tmp/${name}

  cd ./tmp
  zip -r ../release/${name}.zip ./${name}
  cd ..
fi

rm -rf ./tmp

echo "Packaged build: ${name}.zip"
