const TABS = {};

function clickHandler(tab) {
	browser.tabs.create({
		url: TABS[tab.id][0].href
	});
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

function updatePageAction(tab, links) {
	if (links.length > 0) {
		TABS[tab.id] = links;
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
	if (tab.status === 'complete') {
		browser.tabs.sendMessage(tab.id, {type: 'scan'});
	}
}

function refreshAllTabsPageAction() {
	browser.tabs.query({}).then(tabs => tabs.forEach(scanPage)).catch(console.error);
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
refreshAllTabsPageAction();
