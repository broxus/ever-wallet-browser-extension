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
  name="sparx-tag-${tag}-${version}-${variant}-${commit}"
fi

mkdir -p release
mkdir -p tmp
cp -r ./dist ./tmp/${name}

cd ./tmp
zip -r ../release/${name}.zip ./${name}
cd ..

rm -rf ./tmp

echo "Packaged build: ${name}.zip"