![version](https://img.shields.io/badge/version-0.1.4-blue)
![GitHub](https://img.shields.io/github/license/zaksid/ext-duplicate-bookmarks-finder)


# Duplicate Bookmarks Finder

Find and delete duplicate bookmarks.

<p align="center">
    <a href="https://chrome.google.com/webstore/detail/duplicate-bookmarks-finde/mmfbmpbplefbggnhpiojnhcadkhglnlf">
        <img src="store_images/cws_badge_large_border.png" alt="Get Duplicate Bookmarks Finder for Firefox" style="height: 60px">
    </a>
    <a href="https://addons.mozilla.org/addon/duplicate-bookmarks-finder/">
        <img src="store_images/amo_badge.png" alt="Get Duplicate Bookmarks Finder for Firefox" style="height: 60px">
    </a>
</p>

This extension allows to find and delete duplicate bookmarks.

<p align="center">
    <img src="store_images/screenshot_1.png" style=" width: 250px">
    <img src="store_images/screenshot_2.png" style=" width: 250px">
    <img src="store_images/screenshot_3.png" style=" width: 250px">
    <img src="store_images/screenshot_4.png" style=" width: 250px">
</p>

## Developer section

### Dev dependencies

To install dev dependencies run:
```
npm i
```

Available npm scripts:
- `lint:js` - run eslint on project.
- `lint:css` - run stylelint on project.

### Updating extension version

To update extension version in all places where it's contained (manifests, README...), run
```
bash set-version.sh -v X.Y.Z.
```

### Packing extension for store

To prepare zip archive for publishing in browser app store, run
```
bash pack.sh
```
It copies only files and folder required for extension itself into zip.
By default it will pack files for Chrome browser (with MV3). Mozilla Firefox requires MV2, to prepare zip for it run
```
bash pack.sh -b ff
```

## Possible further enhancements

* [ ] Find -> new search/find again
* [ ] Rewrite with modules + Webpack?
* [ ] Sort by folder path
* [ ] Delete folder if empty after deletion duplicates
