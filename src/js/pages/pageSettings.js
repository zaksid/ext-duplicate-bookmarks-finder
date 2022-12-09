/* eslint-disable func-names, prefer-destructuring */
/* global mdc, Mustache */

import { getDefaultExtensionSettings, getExtensionSettings, setExtensionSettings } from '../utils/index.js';
import { MainNavBtnIcons, MainNavBtnClasses } from '../constants.js';

const { MDCSwitch } = mdc.switchControl;
const { MDCTextField } = mdc.textField;

export default async function initSettingsPage(browserInstance) {
    const appBarNavBtn = document.querySelector('#app-bar-nav-btn');
    const appBarTitle = document.querySelector('#app-bar-title');

    appBarNavBtn.innerHTML = MainNavBtnIcons.BACK;
    appBarNavBtn.classList.add(MainNavBtnClasses.IS_MENU_CONTENT);

    appBarTitle.innerHTML = browserInstance.i18n.getMessage('menu_settings');

    const isFirefox = navigator.userAgent.includes('Firefox');
    const userSettings = await getExtensionSettings(browserInstance);
    const onOffSettings = [
        // TODO: Add dark theme
        // {
        //     id: 'darkMode',
        //     name: browserInstance.i18n.getMessage('settingDarksTheme'),
        //     value: userSettings.darkMode,
        // },
    ];

    if (isFirefox) {
        onOffSettings.push({
            id: 'showSeparators',
            name: browserInstance.i18n.getMessage('settingShowSeparators'),
            description: browserInstance.i18n.getMessage('settingShowSeparatorsDescription'),
            value: userSettings.showSeparators,
        });
    }

    const settingsTemplateResponse = await fetch('templates/settings-page.mustache');
    const settingsTemplate = await settingsTemplateResponse.text();

    document.querySelector('#main-content').innerHTML = await Mustache.render(settingsTemplate, {
        onOffSettings,
        ignoredUrls: userSettings.ignoredUrls,
        i18n: {
            btn_add: browserInstance.i18n.getMessage('btn_add'),
            input_hint_ignoredUrlRegex: browserInstance.i18n.getMessage('input_hint_ignoredUrlRegex'),
            settingIgnoredPatterns: browserInstance.i18n.getMessage('settingIgnoredPatterns'),
            settingIgnoredPatternsDescription: browserInstance.i18n.getMessage('settingIgnoredPatternsDescription'),
        },
    });

    const settingsPage = document.querySelector('#settings-page');
    settingsPage.querySelectorAll('.mdc-text-field').forEach((inputElement) => {
        // eslint-disable-next-line no-new
        new MDCTextField(inputElement);
    });

    const form = settingsPage.querySelector('#ignored-patterns-form');
    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const ignoredUrls = formData.get('ignoredUrls');
        // TODO: Move to mustache template to avoid duplication?
        const chipMarkup = `
        <span class="mdc-chip" role="row" id="c1">
            <span class="mdc-chip__cell mdc-chip__cell--primary" role="gridcell">
                <button class="mdc-chip__action mdc-chip__action--primary" type="button"
                    tabindex="-1">
                    <span class="mdc-chip__ripple mdc-chip__ripple--primary"></span>
                    <span class="mdc-chip__text-label">${ignoredUrls}</span>
                    <i class="material-icons mdc-chip__icon mdc-chip__icon--trailing remove-ignored-url" data-val="${ignoredUrls}"
                        tabindex="0" role="button">cancel</i>
                </button>
            </span>
        </span>`;

        const newChip = document.createElement('span');
        newChip.innerHTML = chipMarkup;
        document.querySelector('.mdc-chip-set__chips').append(newChip);

        userSettings.ignoredUrls = [...userSettings.ignoredUrls, ignoredUrls];
        await setExtensionSettings(browserInstance, userSettings);

        this.reset();
    });

    settingsPage.querySelectorAll('.mdc-switch').forEach((switchElem) => {
        const switchControl = new MDCSwitch(switchElem);
        switchControl.selected = userSettings[switchControl.root.name];

        switchElem.addEventListener('click', async (event) => {
            const settingsElem = event.currentTarget;
            if (settingsElem.name in userSettings) {
                userSettings[settingsElem.name] = settingsElem.attributes['aria-checked'].value === 'true';
                await setExtensionSettings(browserInstance, userSettings);
            }
        });
    });

    const removeIgnoredUrl = async function () {
        const urlPattern = this.dataset.val;
        const index = userSettings.ignoredUrls.indexOf(urlPattern);

        userSettings.ignoredUrls.splice(index, 1);
        await setExtensionSettings(browserInstance, userSettings);

        this.closest('.mdc-chip').remove();
    };

    settingsPage.addEventListener('click', function (event) {
        // loop parent nodes from the target to the delegation node
        for (let target = event.target; target && target !== this; target = target.parentNode) {
            if (target.classList.contains('remove-ignored-url')) {
                removeIgnoredUrl.call(target, event);
                break;
            }
        }
    }, false);

    settingsPage.querySelector('#reset-settings').addEventListener('click', async () => {
        await setExtensionSettings(browserInstance, getDefaultExtensionSettings());
        await initSettingsPage(browserInstance);
    });
}
