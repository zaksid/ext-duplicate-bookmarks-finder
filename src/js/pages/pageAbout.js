/* global Mustache */

import Config from '../configuration.js';
import { MainNavBtnIcons, MainNavBtnClasses } from '../constants.js';

export default async function initAboutPage(browserInstance) {
    const appBarNavBtn = document.querySelector('#app-bar-nav-btn');
    const appBarTitle = document.querySelector('#app-bar-title');

    appBarNavBtn.innerHTML = MainNavBtnIcons.BACK;
    appBarNavBtn.classList.add(MainNavBtnClasses.IS_MENU_CONTENT);

    appBarTitle.innerHTML = browserInstance.i18n.getMessage('menu_about');

    const aboutTemplateResponse = await fetch('templates/about-page.mustache');
    const aboutTemplate = await aboutTemplateResponse.text();

    document.querySelector('#main-content').innerHTML = Mustache.render(aboutTemplate, {
        extensionName: browserInstance.i18n.getMessage('extensionName'),
        version: browserInstance.getExtensionVersion(),
        githubUrl: Config.githubUrl,
        i18n: {
            alt_extIcon: browserInstance.i18n.getMessage('alt_extIcon'),
            txt_version: browserInstance.i18n.getMessage('txt_version'),
        },
    });
}
