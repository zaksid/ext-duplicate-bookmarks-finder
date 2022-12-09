/* eslint-disable import/extensions, no-new */
/* global mdc, chrome, browser, Mustache */

import Browser from './Browser.js';
import Bookmarks from './Bookmarks.js';
import initSettingsPage from './pages/pageSettings.js';
import initAboutPage from './pages/pageAbout.js';
import { isSeparator } from './utils/index.js';
import { MainNavBtnIcons, MainNavBtnClasses } from './constants.js';

const { MDCDialog } = mdc.dialog;
const { MDCMenu } = mdc.menu;
const { MDCMenuSurface } = mdc.menuSurface;
const { MDCRipple } = mdc.ripple;
const { MDCSnackbar } = mdc.snackbar;
const { MDCTopAppBar } = mdc.topAppBar;

const Classes = {
    MENU_OPENED: 'menu-opened', // also used for CSS rotate
};

const state = {
    duplicatesSearchResult: null,
    selectedDuplicates: null,
};

const browserInstance = new Browser(navigator.userAgent.includes('Chrome') ? chrome : browser);

document.addEventListener('DOMContentLoaded', init.bind(this, false));

async function init(isReInit) {
    await initSearchTemplate();
    initMDCComponents(isReInit);

    const appBarTitle = document.querySelector('#app-bar-title');
    appBarTitle.innerHTML = browserInstance.i18n.getMessage('extensionName');

    const menuSettingsText = document.querySelector('#menuitem-settings .mdc-list-item__text');
    menuSettingsText.innerHTML = browserInstance.i18n.getMessage('menu_settings');

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
                document.querySelector(`#${id}`).click();
            });
        }
    }
}

// TODO
// eslint-disable-next-line no-unused-vars
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
        },
    }, {
        loader: loaderTemplate,
    });
}

function initMDCComponents(isReInit) {
    const findButton = document.querySelector('.mdc-button');
    const topAppBarElement = document.querySelector('.mdc-top-app-bar');

    new MDCRipple(findButton);
    new MDCTopAppBar(topAppBarElement);

    if (!isReInit) {
        const menu = new MDCMenu(document.querySelector('.mdc-menu'));
        const menuBtn = document.querySelector('#app-bar-menu-btn');
        const menuSurface = new MDCMenuSurface(document.querySelector('.mdc-menu-surface'));
        menuSurface.listen('MDCMenuSurface:closed', () => menuBtn.classList.remove(Classes.MENU_OPENED));
        menuBtn.addEventListener('click', openMenuHandler.bind(this, menu, menuBtn));
    }
}

function mainNavBtnClickHandler() {
    if (this.classList.contains(MainNavBtnClasses.IS_MENU_CONTENT)) {
        const appBarNavBtn = document.querySelector('#app-bar-nav-btn');
        appBarNavBtn.innerHTML = MainNavBtnIcons.APP_MAIN;

        init(true);
    }
}

function openMenuHandler(menu, menuBtn) {
    const classes = menuBtn.classList;
    const classMenuOpened = Classes.MENU_OPENED;

    if (classes.contains(classMenuOpened)) {
        classes.remove(classMenuOpened);
        return;
    }

    classes.add(classMenuOpened);
    // eslint-disable-next-line no-param-reassign
    menu.open = true;

    const menuItemAbout = document.querySelector('#menuitem-about');
    menuItemAbout.addEventListener('click', initAboutPage.bind(this, browserInstance));

    const menuItemSettings = document.querySelector('#menuitem-settings');
    menuItemSettings.addEventListener('click', initSettingsPage.bind(this, browserInstance));
}

async function findBookmarksHandler(event) {
    event.preventDefault();

    const shouldClear = !!state.duplicatesSearchResult;

    state.duplicatesSearchResult = null;

    const searchResultsContainer = document.querySelector('#search-results');
    searchResultsContainer.hidden = false;

    if (shouldClear) {
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
    const bookmarks = await bookmarksInstance.getDuplicates(browserInstance, ignoredUrls);

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
        cards: array.map((matches, ind) => {
            const isSeparatorrr = isSeparator(matches[0]?.url);

            return {
                url: isSeparatorrr
                    ? browserInstance.i18n.getMessage('txt_separators')
                    : prepareCardTitleUrl(matches[0]?.url),
                items: matches.map((match) => {
                    const obj = { ...match };
                    if (isSeparatorrr) {
                        obj.title = browserInstance.i18n.getMessage('txt_separator');
                        obj.url = '';
                    }

                    return obj;
                }),
                i18n: {
                    txt_cardMatchNo: browserInstance.i18n.getMessage('txt_cardMatchNo', (ind + 1).toString()),
                    txt_path: browserInstance.i18n.getMessage('txt_path'),
                },
            };
        }),
        i18n: {
            btn_deleteSelected: browserInstance.i18n.getMessage('btn_deleteSelected'),
            msg_FoundQty: duplicatesQty
                ? browserInstance.i18n.getMessage('msgFoundQty', duplicatesQty.toString())
                : browserInstance.i18n.getMessage('msgFoundNone'),
        },
    };
    const partial = {
        card: bookmarkCardTemplate,
    };

    const searchResultsContainer = document.querySelector('#search-results');
    searchResultsContainer.innerHTML = Mustache.render(searchResultsTemplate, data, partial);
    searchResultsContainer.hidden = false;

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
        });
    };
    document.addEventListener('change', (e) => {
        // loop parent nodes from the target to the delegation node
        // eslint-disable-next-line prefer-destructuring
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

            // Hide removed bookmarks
            const selectedCheckboxes = form.querySelectorAll('input[type="checkbox"]:checked');
            selectedCheckboxes.forEach(async (checkbox) => {
                const parent = checkbox.closest('.duplicate-li');
                await hideElementWithAnimation(parent);

                // Hide li divider
                const prevSibling = parent.previousElementSibling;
                if (prevSibling && prevSibling.classList.contains('mdc-list-divider')) {
                    prevSibling.style.display = 'none';
                }
            });

            // Hide empty cards
            document.querySelectorAll('.bookmark-card-content').forEach((card) => {
                const removedQty = card.querySelectorAll('.duplicate-li.removed').length;
                const allQty = card.querySelectorAll('.duplicate-li').length;

                if (removedQty === allQty) {
                    hideElementWithAnimation(card);
                }
            });

            // Disable "Delete selected" button
            const deleteButton = form.querySelector('.mdc-button');
            deleteButton.disabled = true;

            // Hide alert
            const alert = document.querySelector('.alert-warning');
            if (alert) {
                hideElementWithAnimation(alert);
            }

            const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
            snackbar.open();
        }
    });
}

function hideElementWithAnimation(element) {
    element.classList.add('removed');
    element.addEventListener('transitionend', () => {
        // eslint-disable-next-line no-param-reassign
        element.style.display = 'none';
    });

    return Promise.resolve();
}
