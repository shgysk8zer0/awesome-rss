const TABS = {};
const defaultOpts = {
	icon:        'light',
	openFeed:    'current',
	template:    'regular-template',
	color:       '#101010',
	fontFamily:  'Arial, Helvetica, sans-serif',
	fontSize:    14,
	feedMargin:  0,
	feedPadding: 7,
	bgColor:     '#ffffff',
};

const storage = browser.storage.sync;

const ICONS = {
	light: 'icons/subscribe-64.svg',
	dark: 'icons/subscribe-dark-64.svg',
	orange: 'icons/subscribe-orange-64.svg',
};

async function clickHandler(tab) {
	const opts = await storage.get('openFeed');
	if (opts.hasOwnProperty('openFeed')) {
		switch (opts.openFeed) {
		case 'window':
			browser.windows.create({url: TABS[tab.id][0].href});
			break;
		case 'tab':
			browser.tabs.create({url: TABS[tab.id][0].href});
			break;
		case 'current':
			browser.tabs.update(null, {url: TABS[tab.id][0].href});
			break;
		default:
			throw new Error(`Unsupported open feed method: ${opts.openFeed}`);
		}
	} else {
		browser.tabs.update(null, {url: TABS[tab.id][0].href});
	}
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/pageAction/setTitle
async function updatePageAction(tab, links) {
	if (links.length > 0) {
		TABS[tab.id] = links;
		const opts = await storage.get('icon');
		if (! ICONS.hasOwnProperty(opts.icon)) {
			opts.icon = defaultOpts.icon;
		}
		browser.pageAction.setIcon({
			tabId: tab.id,
			path: ICONS[opts.icon]
		});
		browser.pageAction.setTitle({
			tabId: tab.id,
			title: browser.i18n.getMessage('pageActionTooltip'),
		});
		browser.pageAction.show(tab.id);
	}
	if (links.length === 1) {
		browser.pageAction.onClicked.addListener(clickHandler);
	} else if (links.length > 1) {
		const url = new URL(browser.runtime.getURL('popup.html'));
		url.searchParams.set('links', JSON.stringify(links));
		browser.pageAction.setPopup({
			tabId: tab.id,
			popup: url.toString()
		});
	} else {
		browser.pageAction.setTitle({
			tabId: tab.id,
			title: browser.i18n.getMessage('extensionNA'),
		});
	}
}

function messageHandler(msg, sender) {
	switch (msg.type) {
	case 'feeds':
		updatePageAction(sender.tab, msg.links);
		break;
	}
}

function scanPage(tab) {
	// transitionType will be set on `HistoryStateUpdated` & status will not
	if (tab.hasOwnProperty('transitionType') || tab.status === 'complete') {
		browser.tabs.sendMessage(tab.id || tab.tabId, {type: 'scan'});
		browser.pageAction.setTitle({
			title: browser.i18n.getMessage('extensionNA'),
			tabId: tab.id || tab.tabId,
		});
		window.dne = console.log;
	} else if (typeof(tab) === 'number') {
		browser.tabs.sendMessage(tab, {type: 'scan'});
	}
}

async function refreshAllTabsPageAction() {
	const tabs = await browser.tabs.query({});
	tabs.forEach(scanPage);
}

async function optChange(opts) {
	if (opts.hasOwnProperty('icon') && opts.icon.newValue !== opts.icon.oldValue) {
		const tabs = await browser.tabs.query({status: 'complete'});
		let icon = opts.icon.newValue;
		if (! ICONS.hasOwnProperty(icon)) {
			icon = ICONS[defaultOpts.icon];
		} else {
			icon = ICONS[icon];
		}
		tabs.forEach(tab => browser.pageAction.setIcon({
			tabId: tab.id,
			path: icon
		}));
	}
}

async function updateHandler(update) {
	if (update.temporary) {
		storage.get().then(opts => console.log({update, opts}));
	}
	if (update.reason === 'install') {
		storage.set(defaultOpts);
	} else if (update.reason === 'update') {
		/*eslint no-fallthrough: "off"*/
		/*eslint no-case-declarations: "off"*/
		let opts = await storage.get();
		const localOpts = await browser.storage.local.get();

		switch (update.previousVersion) {
		case '1.0.0':
		case '1.0.1':
			if (localOpts.hasOwnProperty('icon')) {
				const key = Object.keys(ICONS).find(icon => {
					return ICONS[icon] === opts.icon.replace('16', '64');
				});
				localOpts.icon = ICONS.hasOwnProperty(key) ? key : defaultOpts.icon;
			} else {
				localOpts.icon = defaultOpts.icon;
			}
			if (! opts.hasOwnProperty('openFeed')) {
				opts.openFeed = defaultOpts.openFeed;
			}

		case '1.0.2':
			localOpts.template = defaultOpts.template;
			localOpts.fontFamily = defaultOpts.fontFamily;
			localOpts.fontSize = defaultOpts.fontSize;
			localOpts.feedMargin = defaultOpts.feedMargin;
			localOpts.feedPadding = defaultOpts.feedPadding;
			localOpts.bgColor = defaultOpts.bgColor;

		case '1.1.0':
			Object.keys(opts).forEach(key => localOpts[key] = opts[key]);
			storage.set(localOpts);
			browser.storage.local.clear();
		}
	}
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.storage.onChanged.addListener(optChange);
browser.runtime.onInstalled.addListener(updateHandler);
refreshAllTabsPageAction();
