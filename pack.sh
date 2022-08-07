#!/bin/bash

# By default manifest.json (version 3) is usef.
# To pack for Firefox manifest_v2.json (MV2) should be used.
# Pass flag -b ff.

if [[ -d "tmp" ]]; then
    rm -rf tmp
fi

mkdir tmp
cp -r ./css ./fonts ./images ./js ./lib ./templates tmp/

browser="chrome"

while getopts ":b:" o; do
    case "${o}" in
        b)
            arg=${OPTARG}

            if [ "$arg" == "ff" ]
            then
                browser="firefox"
            fi
            ;;
        *)
            browser="chrome"
            ;;
    esac
done

if [ "$browser" == "firefox" ]
then
    cp manifest_v2.json tmp/manifest.json
else
    cp manifest.json tmp/
fi

zip -r extension-${browser}.zip tmp
rm -rf tmp
