#!/bin/bash

help="
\n
Usage \n
    \t bash pack.sh \n\n
Example \n
    \t bash pack.sh -p firefox -m dev \n\n
Options \n
    \t -p           \t\t platform - Platform to build for. \n
                    \t\t\t Possible values: 'firefox', 'opera'. Default (param not provided) 'chromium'. \n\n
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
            elif [[ "$arg" == "opera" ]]; then
                platform="opera"
            fi

            echo -e "> Platform: ${platform}"
            ;;
        m)
            arg=${OPTARG}

            if [[ "$arg" == "dev" ]]; then
                mode="development"
            fi

            echo -e "> Mode: ${mode}"
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
rm build/css/*.scss
rm build/css/*.map

if [[ "$platform" == "opera" ]]; then
    cp ./platform/chromium/manifest.json build
else
    cp ./platform/${platform}/manifest.json build
fi

if [[ "$platform" == "opera" ]]; then
    echo -e "> Renaming mustashe templates for Opera..."
    find build/templates/ -name '*.mustache' -exec sh -c 'mv "$0" "${0%.mustache}.mustache.html"' {} \;
    sed -i '' -r -E "s/\.mustache/\.mustache\.html/g" build/js/popup.js
    echo -e "> ...done"
fi

#if [[ "$mode" == "development" ]]; then
    cd build
    zip -r extension-${platform}.zip *
    mv extension-${platform}.zip ../
    cd ../

    if [[ "$platform" == "opera" ]]; then
        mv extension-${platform}.zip extension-${platform}.crx
    fi
#fi

if [[ "$mode" == "publishing" ]]; then
    rm -rf build
fi
