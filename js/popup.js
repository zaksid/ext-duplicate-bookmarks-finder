import Browser from './Browser.js';
import Bookmarks from './Bookmarks.js';

const MDCDialog = mdc.dialog.MDCDialog;
const MDCMenu = mdc.menu.MDCMenu;
const MDCRipple = mdc.ripple.MDCRipple;
const MDCSnackbar = mdc.snackbar.MDCSnackbar;
const MDCTextField = mdc.textField.MDCTextField;
const MDCTopAppBar = mdc.topAppBar.MDCTopAppBar;

const Config = {
    'githubUrl': 'https://github.com/zaksid/ext-duplicate-bookmarks-finder'
};

const MainNavBtnIcons = {
    APP_MAIN: '<span class="app_icon-icon_bw"></span>',
    BACK: 'arrow_back'
};

const MainNavBtnClasses = {
    ABOUT: 'is-about-content'
};

const state = {
    duplicatesSearchResult: null,
    selectedDuplicates: null
};

const browserInstance = new Browser(navigator.userAgent.includes('Chrome') ? chrome : browser);

document.addEventListener('DOMContentLoaded', init);

async function init() {
    await initSearchTemplate();
    initMDCComponents();

    const appBarTitle = document.querySelector('#app-bar-title');
    appBarTitle.innerHTML = browserInstance.i18n.getMessage('extensionName');

    const menuAboutText = document.querySelector('#menuitem-about .mdc-list-item__text');
    menuAboutText.innerHTML = browserInstance.i18n.getMessage('menu_about');

    const findBookmarksForm = document.querySelector('#find-bookmarks');
    findBookmarksForm.addEventListener('submit', findBookmarksHandler);

    // TODO
    // const showAllBtn = document.querySelector('#showAll');
    // showAllBtn.addEventListener('click', showAllHandler)

    const appBarNavBtn = document.querySelector('#app-bar-nav-btn');
    appBarNavBtn.addEventListener('click', mainNavBtnClickHandler);

    if (state.duplicatesSearchResult) {
        await renderSearchResults(state.duplicatesSearchResult);

        if (state.selectedDuplicates) {
            state.selectedDuplicates.forEach((id) => {
                document.querySelector(`#${id}`).click()
            });
        }
    }
}

// TODO
async function showAllHandler() {
    const searchResultsContainer = document.querySelector('#search-results');

    searchResultsContainer.hidden = false;

    const bookmarksTree = await browserInstance.getBookmarksTree();
    const bookmarksInstance = new Bookmarks(bookmarksTree);
    const bookmarks = bookmarksInstance.getBookmarks();

    const allBookmarksTemplateResponse = await fetch('templates/all-bookmarks.mustache');
    const allBookmarksTemplate = await allBookmarksTemplateResponse.text();

    searchResultsContainer.innerHTML = Mustache.render(allBookmarksTemplate, {
        bookmarks,
    });

    console.log(bookmarks);
}

async function initSearchTemplate() {
    const searchTemplateResponse = await fetch('templates/search-page.mustache');
    const searchCardTemplate = await searchTemplateResponse.text();

    const loaderTemplateResponse = await fetch('templates/loader.mustache');
    const loaderTemplate = await loaderTemplateResponse.text();

    document.querySelector('#main-content').innerHTML = Mustache.render(searchCardTemplate, {
        i18n: {
            btn_findDuplicates: browserInstance.i18n.getMessage('btn_findDuplicates'),
            btn_cancel: browserInstance.i18n.getMessage('btn_cancel'),
            btn_delete: browserInstance.i18n.getMessage('btn_delete'),
            bookmarksDeleteConfirmationTitle: browserInstance.i18n.getMessage('bookmarksDeleteConfirmationTitle'),
            bookmarksDeleteConfirmation: browserInstance.i18n.getMessage('bookmarksDeleteConfirmation'),
            bookmarksDeletedMsg: browserInstance.i18n.getMessage('bookmarksDeletedMsg'),
            input_hint_ignoredUrlRegex: browserInstance.i18n.getMessage('input_hint_ignoredUrlRegex')
        }
    }, {
        loader: loaderTemplate
    });
}

function initMDCComponents() {
    const findButton = document.querySelector('.mdc-button');
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');
    const inputElement = document.querySelector('.mdc-text-field');

    new MDCRipple(findButton);
    new MDCTextField(inputElement);
    new MDCTopAppBar(topAppBarElement);

    const menu = new MDCMenu(document.querySelector('.mdc-menu'));
    menu.open = false;

    document.querySelector('#app-bar-menu-btn').addEventListener('click', openMenuHandler.bind(this, menu));
}

function mainNavBtnClickHandler() {
    if (this.classList.contains(MainNavBtnClasses.ABOUT)) {
        const appBarNavBtn = document.querySelector('#app-bar-nav-btn');

        appBarNavBtn.innerHTML = MainNavBtnIcons.APP_MAIN;

        init();
    }
}

async function menuAboutClickHandler() {
    const appBarNavBtn = document.querySelector('#app-bar-nav-btn');
    const appBarTitle = document.querySelector('#app-bar-title');

    appBarNavBtn.innerHTML = MainNavBtnIcons.BACK;
    appBarNavBtn.classList.add(MainNavBtnClasses.ABOUT);

    appBarTitle.innerHTML = browserInstance.i18n.getMessage('menu_about');

    const aboutTemplateResponse = await fetch('templates/about-page.mustache');
    const aboutTemplate = await aboutTemplateResponse.text();

    document.querySelector('#main-content').innerHTML = Mustache.render(aboutTemplate, {
        extensionName: browserInstance.i18n.getMessage('extensionName'),
        version: browserInstance.getExtensionVersion(),
        githubUrl: Config.githubUrl,
        i18n: {
            alt_extIcon: browserInstance.i18n.getMessage('alt_extIcon'),
            txt_version: browserInstance.i18n.getMessage('txt_version')
        }
    });
}

function openMenuHandler(menu) {
    if (menu.open) {
        menu.open = false;
    } else {
        menu.open = true;
    }

    const menuItemAbout = document.querySelector('#menuitem-about');
    menuItemAbout.addEventListener('click', menuAboutClickHandler);
}

async function findBookmarksHandler(event) {
    event.preventDefault();

    const shouldClear = !!state.duplicatesSearchResult;

    state.duplicatesSearchResult = null;

    const searchResultsContainer = document.querySelector('#search-results');
    searchResultsContainer.hidden = false;

    if (shouldClear){
        const searchResultsTemplate = await (await fetch('templates/search-results.mustache')).text();
        const loaderTemplate = await (await fetch('templates/loader.mustache')).text();

        searchResultsContainer.innerHTML = Mustache.render(searchResultsTemplate, {
            isLoader: true,
        }, {
            loader: loaderTemplate,
        });
    }

    const formData = new FormData(this);
    const ignoredUrls = formData.get('ignoredUrls');

    const bookmarksTree = await browserInstance.getBookmarksTree();
    const bookmarksInstance = new Bookmarks(bookmarksTree);
    const bookmarks = bookmarksInstance.getDuplicates(ignoredUrls);

    state.duplicatesSearchResult = bookmarks;

    await renderSearchResults(bookmarks);
}

async function renderSearchResults(array) {
    const searchResultsTemplateResponse = await fetch('templates/search-results.mustache');
    const searchResultsTemplate = await searchResultsTemplateResponse.text();

    const bookmarkCardTemplateResponse = await fetch('templates/bookmark-card.mustache');
    const bookmarkCardTemplate = await bookmarkCardTemplateResponse.text();

    const duplicatesQty = array.length;
    const data = {
        hasResults: !!duplicatesQty,
        cards: array.map((matches, ind) => ({
            url: prepareCardTitleUrl(matches[0]?.url),
            items: matches,
            i18n: {
                txt_cardMatchNo: browserInstance.i18n.getMessage('txt_cardMatchNo', (ind + 1).toString()),
                txt_path: browserInstance.i18n.getMessage('txt_path')
            }
        })),
        i18n: {
            btn_deleteSelected: browserInstance.i18n.getMessage('btn_deleteSelected'),
            msg_FoundQty: duplicatesQty
                ? browserInstance.i18n.getMessage('msgFoundQty', duplicatesQty.toString())
                : browserInstance.i18n.getMessage('msgFoundNone')
        }
    };
    const partial = {
        card: bookmarkCardTemplate
    };

    document.querySelector('#search-results').innerHTML = Mustache.render(searchResultsTemplate, data, partial);

    const duplicateBookmarksForm = document.querySelector('#bookmarks-list');
    duplicateBookmarksForm.addEventListener('submit', deleteDuplicatesSubmitHandler);

    const deleteButton = duplicateBookmarksForm.querySelector('.mdc-button');
    new MDCRipple(deleteButton);

    const elementSelector = 'duplicate-checkbox';
    const handler = () => {
        const selectedCheckboxes = duplicateBookmarksForm.querySelectorAll('input[type="checkbox"]:checked');
        deleteButton.disabled = !selectedCheckboxes.length;

        state.selectedDuplicates = [];
        selectedCheckboxes.forEach((checkbox) => {
            state.selectedDuplicates.push(checkbox.id);
        })
    };
    document.addEventListener('change', (e) => {
        // loop parent nodes from the target to the delegation node
        for (let target = e.target; target && target !== this; target = target.parentNode) {
            if (target.classList.contains(elementSelector)) {
                handler.call(target, e);
                break;
            }
        }
    }, false);
}

function prepareCardTitleUrl(url = '') {
    const httpsRegex = /http(s)?:\/\//;
    return url.replace(httpsRegex, '');
}

function deleteDuplicatesSubmitHandler(event) {
    event.preventDefault();

    const form = this;
    const formData = new FormData(form);
    const selectedBookmarks = formData.getAll('duplicate');

    const dialog = new MDCDialog(document.querySelector('.mdc-dialog'));
    dialog.open();
    dialog.listen('MDCDialog:closed', (action) => {
        if (action.detail.action === 'confirm') {
            browserInstance.removeBookmarks(selectedBookmarks);

            const selectedCheckboxes = form.querySelectorAll('input[type="checkbox"]:checked');

            selectedCheckboxes.forEach((checkbox) => {
                const parent = checkbox.closest('.duplicate-li');
                parent.classList.add('removed');
                parent.addEventListener('transitionend', () => {
                    // Hide li of duplicate
                    parent.style.display = 'none';

                    // Hide li divider
                    const prevSibling = parent.previousElementSibling;
                    if (prevSibling && prevSibling.classList.contains('mdc-list-divider')) {
                        prevSibling.style.display = 'none';
                    }

                    // Disable "Delete selected" button
                    const deleteButton = form.querySelector('.mdc-button');
                    deleteButton.disabled = true;
                });
            });

            const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
            snackbar.open();
        }
    });
}
