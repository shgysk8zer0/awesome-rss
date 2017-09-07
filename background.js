function scanPage(tab) {
	browser.runtime.onMessage.addListener(links => {
		if (links.length !== 0) {
			browser.pageAction.show(tab.tabId);
			browser.pageAction.onClicked.addListener(() => {
				browser.tabs.create({
					url: links[0].href
				});
			});
		}
	});
	browser.tabs.sendMessage(tab.tabId, {});
}

browser.tabs.onCreated.addListener(scanPage);
browser.tabs.onActivated.addListener(scanPage);
browser.tabs.onUpdated.addListener(scanPage);
