#!/bin/bash

version=$(jq .version ./dist/manifest.json -r)
variant=""

while getopts 'v:' flag; do
  case "${flag}" in
    v) variant="${OPTARG}" ;;
    *) exit 1 ;;
  esac
done

name="everwallet-extension-${version}-${variant}"

mkdir -p release
mkdir -p tmp
cp -r ./dist ./tmp/${name}
pushd ./tmp
zip ../release/${name}.zip ./${name} -r
popd
rm -rf ./tmp
