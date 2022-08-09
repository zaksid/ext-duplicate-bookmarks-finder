#!/bin/bash

version=""

while getopts ":v:" o; do
    case "${o}" in
        v)
            version=${OPTARG}
            ;;
        *)
            ;;
    esac
done

if [[ "$version" == "" ]]
then
    echo "⚠️ Please provide version number!"
    exit 1
fi

sed -i '' -r -E "s/(\"version\": \")([0-9]+\.[0-9]+\.?[0-9]?)(\")/\1$version\3/g" platform/chromium/manifest.json
sed -i '' -r -E "s/(\"version\": \")([0-9]+\.[0-9]+\.?[0-9]?)(\")/\1$version\3/g" platform/firefox/manifest.json
sed -i '' -r -E "s/(version-)([0-9]+\.[0-9]+\.?[0-9]?)(\.*)/\1$version\3/g" README.md
