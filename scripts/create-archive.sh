#!/bin/bash

version=$(jq .version package.json -r)
commit=$(git rev-parse --short HEAD)

while getopts 'v:' flag; do
  case "${flag}" in
    v) variant="${OPTARG}" ;;
    *) exit 1 ;;
  esac
done

tag=$(git describe --tags --abbrev=0 2>/dev/null)

if [ -z "$tag" ]; then
  tag=$version
fi

additional_commits=$(git rev-list ${tag}..HEAD --count 2>/dev/null || echo "0")

name="sparx-${tag}-${additional_commits}-${variant}-${commit}"

mkdir -p release
mkdir -p tmp
cp -r ./dist ./tmp/${name}

cd ./tmp
zip -r ../release/${name}.zip ./${name}
cd ..

rm -rf ./tmp

echo "Packaged build: ${name}.zip"