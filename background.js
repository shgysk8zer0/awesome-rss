const TABS = {};

function clickHandler(tab) {
	browser.tabs.create({
		url: TABS[tab.id].links[0].href
	});
}

function scanTabs(tabs) {
	return tabs.forEach(scanPage);
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

function messageHandler(msg) {
	if (msg === 'ready') {
		browser.tabs.query({
			active: true,
			currentWindow: true
		}).then(scanTabs).catch(console.error);
	} else if (typeof msg === 'object') {
		if (msg.links.length === 1) {
			TABS[msg.id] = msg;
			browser.pageAction.show(msg.id);
			browser.pageAction.onClicked.addListener(clickHandler);
		} else if (msg.links.length > 1) {
			const url = new URL('popup.html', location.href);
			url.searchParams.set('links', JSON.stringify(msg.links));
			browser.pageAction.setPopup({
				tabId: msg.id,
				popup: url.toString()
			});
			browser.pageAction.show(msg.id);
		}
	}
}

function scanPage(tab) {
	if (typeof tab === 'number') {
		browser.tabs.get(tab).then(scanPage);
	} else if (tab.status === 'complete') {
		browser.tabs.sendMessage(tab.id, {
			id: tab.id,
			title: tab.title,
			url: tab.url
		});
	}
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.tabs.onRemoved.addListener(removeHandler);
