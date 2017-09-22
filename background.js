const TABS = {};

async function clickHandler(tab) {
	const opts = await browser.storage.local.get('openFeed');
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
		const opts = await browser.storage.local.get('icon');
		browser.pageAction.setIcon({
			tabId: tab.id,
			path: opts.icon || 'icons/subscribe-16.svg'
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
browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
browser.tabs.onUpdated.addListener(scanPage);
refreshAllTabsPageAction();
