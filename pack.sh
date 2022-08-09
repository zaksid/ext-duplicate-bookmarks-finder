#!/bin/bash

help="
\n
Usage \n
    \t bash pack.sh \n\n
Example \n
    \t bash pack.sh -p firefox -m dev \n\n
Options \n
    \t -p           \t\t platform - Platform to build for. \n
                    \t\t\t If 'firefox' is specified - build for Firefox publishing. Otherwise - for Chromium. \n\n
    \t -m           \t\t mode - Packing mode. \n
                    \t\t\t If 'dev' is specified - development mode. Create only build folder, don't zip. \n
                    \t\t\t Otherwise mode=publishing (create zip, remove build folder).
"

platform="chromium"
mode="publishing"
is_help=false

while getopts ":p:m:h" o; do
    case "${o}" in
        p)
            arg=${OPTARG}

            if [[ "$arg" == "firefox" ]]; then
                platform="firefox"
            fi
            ;;
        m)
            arg=${OPTARG}

            if [[ "$arg" == "dev" ]]; then
                mode="development"
            fi
            ;;
        h)
            is_help=true
            ;;
        *)
            ;;
    esac
done

if [[ "$is_help" = true ]]; then
    echo -e ${help}
    exit 0
fi

if [[ -d "build" ]]; then
    rm -rf build
fi

mkdir build
cp -r ./src/* build/
rm -f build/manifest*.*
cp ./platform/${platform}/manifest.json build

if [[ "$mode" == "development" ]]; then
    cd build
    zip -r extension-${platform}.zip *
    mv extension-${platform}.zip ../
    cd ../
fi

if [[ "$mode" == "publishing" ]]; then
    rm -rf build
fi
