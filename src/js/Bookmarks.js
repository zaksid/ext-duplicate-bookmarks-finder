/* eslint-disable no-continue */

export default class Bookmarks {
    constructor(bookmarksTree) {
        this.processedBookmarks = [];
        this.#prepareBookmarks(bookmarksTree);
    }

    #prepareBookmarks(bookmarksInput, path = '') {
        // Make a copy of an array to work with
        const bookmarks = bookmarksInput.slice();

        for (let i = 0; i < bookmarks.length; i++) {
            const bookmark = bookmarks[i];

            if (bookmark.url) {
                if (path) {
                    if (!('myPath' in bookmark)) {
                        bookmark.myPath = '';
                    }
                    bookmark.myPath += `${path}/`;
                }
                this.processedBookmarks.push(bookmark);
            }

            if (bookmark.children) {
                this.#prepareBookmarks(bookmark.children, `${path ? `${path}/` : ''}${bookmark.title}`);
            }
        }
    }

    getBookmarks() {
        return this.processedBookmarks;
    }

    getDuplicates(ignoredUrls) {
        const array = this.processedBookmarks.slice();
        const matches = {};
        const httpsRegex = /http(s)?/;
        const ignoredUrlsRegex = new RegExp(ignoredUrls);

        for (let i = 0; i < array.length; i++) {
            const currentElem = array[i];
            let wasMatched = false;

            if (ignoredUrls && ignoredUrlsRegex.test(currentElem.url)) {
                continue;
            }

            for (let j = i + 1; j < array.length; j++) {
                const url1 = currentElem.url.replace(httpsRegex);
                const url2 = array[j].url.replace(httpsRegex);

                if (url1 === url2) {
                    if (!(i in matches)) {
                        matches[i] = [];
                    }
                    matches[i].push(array[j]);
                    array.splice(j, 1);
                    wasMatched = true;
                    j--; // adjust due to deleted element
                }
            }

            if (wasMatched) {
                matches[i].unshift(currentElem);
            }
        }

        return Object.values(matches);
    }
}
