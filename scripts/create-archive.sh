#!/bin/bash

version=$(jq .version ./dist/manifest.json -r)
version="v${version}"
commit=$(git rev-parse --short HEAD)

while getopts 'v:' flag; do
  case "${flag}" in
    v) variant="${OPTARG}" ;;
    *) exit 1 ;;
  esac
done

tag=$(git tag --contains $commit | tail -n 1)

if [ -z "$tag" ]; then
  name="sparx-${version}-${variant}-${commit}"
else
  name="sparx-${tag}-${version}-${variant}-${commit}"
fi

if [ ! -d "./dist-${variant}" ] || [ -z "$(ls -A ./dist-${variant})" ]; then
  if [ -d "./dist" ] && [ ! -z "$(ls -A ./dist)" ]; then
    echo "Build artifacts found in dist, moving to dist-${variant}..."
    mv dist "dist-${variant}"
  else
    echo "No build artifacts found, running build..."
    npm ci
    npm run build:${variant}
    mv dist "dist-${variant}"
  fi
else
  echo "Build artifacts found in dist-${variant}, skipping build."
fi

mkdir -p release
mkdir -p tmp
cp -r "./dist-${variant}" "./tmp/${name}"

cd ./tmp
zip -r "../release/${name}.zip" "./${name}"
cd ..

rm -rf ./tmp

echo "Packaged build: ${name}.zip"