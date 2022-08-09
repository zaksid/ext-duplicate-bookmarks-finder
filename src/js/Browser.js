export default class Browser {
    constructor(browser) {
        this.browser = browser;
        this.i18n = browser.i18n;
    }

    getBookmarksTree() {
        // Will work in Chrome with manifest v3
        // return this.browser.bookmarks.getTree();

        return new Promise((resolve) => {
            this.browser.bookmarks.getTree((results) => {
                resolve(results);
            });
        });
    }

    getExtensionVersion() {
        return this.browser.runtime.getManifest().version;
    }

    removeBookmarks(ids = []) {
        ids.forEach(async (id) => {
            try {
                await this.browser.bookmarks.remove(id);
            } catch (e) {
                console.error(`Cannot delete bookmark with id ${id}: ${e}`);
            }
        });
    }
}
