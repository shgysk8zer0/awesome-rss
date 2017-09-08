const TABS = {};

function scanPage(tab) {
	if (typeof tab === 'number') {
		browser.tabs.get(tab).then(scanPage);
	} else if (tab.status === 'complete') {
		browser.tabs.sendMessage(tab.id, {id: tab.id, title: tab.title, url: tab.url});
	}
}

function messageHandler(msg) {
	if (msg === 'ready') {
		browser.tabs.query({active: true}).then(tabs => {
			tabs.forEach(scanPage);
		}).catch(console.error);
	} else if (typeof msg === 'object') {
		if (msg.links.length !== 0) {
			browser.pageAction.show(msg.id);
			browser.pageAction.onClicked.addListener(clickHandler);
		}
	}
}

function clickHandler(tab) {
	browser.tabs.create({
		url: TABS[tab.id].links[0].href
	});
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.tabs.onRemoved.addListener(removeHandler);
