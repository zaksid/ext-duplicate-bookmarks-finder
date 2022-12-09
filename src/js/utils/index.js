export function getDefaultExtensionSettings() {
    return {
        showSeparators: false,
        darkMode: false,
        ignoredUrls: [],
    };
}

export async function getExtensionSettings(browserInstance) {
    const defaults = getDefaultExtensionSettings();
    const userSettings = await browserInstance.browser.storage.local.get();

    return Object.keys(userSettings).length ? userSettings : defaults;
}

export async function setExtensionSettings(browserInstance, userSettings) {
    await browserInstance.browser.storage.local.set({
        ...userSettings,
    });
}

export function isSeparator(url) {
    return /data:/.test(url);
}
