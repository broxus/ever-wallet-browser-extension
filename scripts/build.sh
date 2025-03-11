#!/bin/bash

version=$(jq .version ./dist/manifest.json -r)
variant=""
commit=$(git rev-parse --short HEAD)

while getopts 'v:' flag; do
  case "${flag}" in
    v) variant="${OPTARG}" ;;
    *) exit 1 ;;
  esac
done

name="sparx-${version}-${variant}-${commit}"

mkdir -p release
mkdir -p tmp
cp -r ./dist ./tmp/${name}

cd ./tmp
zip -r ../release/${name}.zip ./${name}
cd ..

rm -rf ./tmp
