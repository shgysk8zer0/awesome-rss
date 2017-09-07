const TABS = {};
function scanPage(tab) {
	browser.runtime.onMessage.addListener(messageHandler);
	browser.tabs.sendMessage(tab.id, {id: tab.id, title: tab.title, url: tab.url});
}

function messageHandler(tab) {
	TABS[tab.id] = tab;
	if (tab.links.length !== 0) {
		browser.pageAction.show(tab.id);
		browser.pageAction.onClicked.addListener(clickHandler);
	}
}

function clickHandler(tab) {
	browser.tabs.create({
		url: TABS[tab.id].links[0].href
	});
}

function updateHandler(tabId) {
	browser.tabs.get(tabId).then(tab => {
		if (tab.status === 'complete') {
			scanPage(tab);
		}
	});
}

function removeHandler(tabId) {
	delete TABS[tabId];
}

// browser.tabs.onCreated.addListener(console.log);
// browser.tabs.onActivated.addListener(scanPage);
browser.tabs.onUpdated.addListener(updateHandler);
browser.tabs.onDetached.addListener(removeHandler);
