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
		if (msg.links.length !== 0) {
			TABS[msg.id] = msg;
			browser.pageAction.show(msg.id);
			browser.pageAction.onClicked.addListener(clickHandler);
		}
	}
}

function clickHandler(tab) {
	if (TABS[tab.id].links.length === 1) {
		browser.tabs.create({
			url: TABS[tab.id].links[0].href
		});
	} else {
		showPopup(TABS[tab.id]);
	}
}

function showPopup(tab) {
	const url = new URL('popup.html', location.href);
	url.searchParams.set('links', JSON.stringify(tab.links));
	browser.pageAction.setPopup({
		tabId: tab.id,
		popup: url.toString()
	});
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.tabs.onRemoved.addListener(removeHandler);
