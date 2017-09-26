const TABS = {};
const defaultIcon = 'icons/subscribe-64.svg';
const storage = browser.storage.local;

const ICONS = {
	light: "icons/subscribe-64.svg",
	dark: "icons/subscribe-64.svg",
	dark: "icons/subscribe-64-orange.svg",
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
			opts.icon = 'light';
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
			icon = ICONS.light;
		} else {
			icon = ICONS[icon];
		}
		tabs.forEach(tab => browser.pageAction.setIcon({
			tabId: tab.id,
			path: icon
		}));
	}
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.storage.onChanged.addListener(optChange);
refreshAllTabsPageAction();
