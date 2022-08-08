# Duplicate Bookmarks Finder

![version](https://img.shields.io/badge/version-0.1.4-blue)

[<img src="store_images/cws_badge_small_border.png">](https://chrome.google.com/webstore/detail/duplicate-bookmarks-finde/mmfbmpbplefbggnhpiojnhcadkhglnlf)

Find and delete duplicate bookmarks.

|     |     |     |     |
| --- | --- | --- | --- |
| <img src="store_images/screenshot_1.png" style=" width: 250px">      | <img src="store_images/screenshot_2.png" style=" width: 250px"> | <img src="store_images/screenshot_3.png" style=" width: 250px"> | <img src="store_images/screenshot_4.png" style=" width: 250px"> |

This extension allows to find and delete duplicate bookmarks.

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
