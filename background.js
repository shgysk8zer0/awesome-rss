const TABS = {};

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

function messageHandler(msg) {
	if (msg === 'ready') {
		browser.tabs.query({active: true}).then(tabs => {
			tabs.forEach(scanPage);
		}).catch(console.error);
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

function clickHandler(tab) {
	if (TABS[tab.id].links.length === 1) {
		browser.tabs.create({
			url: TABS[tab.id].links[0].href
		});
	}
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.tabs.onRemoved.addListener(removeHandler);
