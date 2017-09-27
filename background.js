const TABS = {};
const defaultOpts = {
	icon:        'light',
	openFeed:    'current',
	template:    'regular-template',
	color:       '#101010',
	fontFamily:  'Arial, Helvetica, sans-serif',
	fontSize:    14,
	feedMargin:  1,
	feedPadding: 10,
};

const storage = browser.storage.local;

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
		storage.get().then(opts => console.log(update, opts));
	}
	if (update.reason === 'install') {
		storage.set(defaultOpts);
	} else if (update.reason === 'update') {
		/*eslint no-fallthrough: "off"*/
		const opts = await storage.get();
		switch (update.previousVersion) {
		case '1.0.0':
		case '1.0.1':
			if (opts.hasOwnProperty('icon')) {
				const key = Object.keys(ICONS).find(icon => {
					return ICONS[icon] === opts.icon.replace('16', '64');
				});
				opts.icon = ICONS.hasOwnProperty(key) ? key : defaultOpts.icon;
			} else {
				opts.icon = defaultOpts.icon;
			}
			if (! opts.hasOwnProperty('openFeed')) {
				opts.openFeed = defaultOpts.openFeed;
			}
			storage.set(opts);
		case '1.0.2':
			opts.template = defaultOpts.template;
			opts.fontFamily = defaultOpts.fontFamily;
			opts.fontSize = defaultOpts.fontSize;
			storage.set(opts);
		}
	}
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.storage.onChanged.addListener(optChange);
browser.runtime.onInstalled.addListener(updateHandler);
refreshAllTabsPageAction();
