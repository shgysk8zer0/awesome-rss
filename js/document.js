function filterLink(link) {
	const LINK_TYPES = ['application/rss+xml', 'application/atom+xml'];
	return LINK_TYPES.includes(link.type);
}

function mapLink(link) {
	const {type, href, title = link.href} = link;
	return {type, href, title};
}

function scanThisPage() {
	const QUERY = 'link[rel="alternate"][type]';
	const LINKS = Array.from(document.querySelectorAll(QUERY));

	const feedLinks = LINKS.filter(filterLink).map(mapLink);
	if (feedLinks.length > 0) {
		browser.runtime.sendMessage({
			type: 'feeds',
			links: feedLinks,
		}).catch(() => {});
	}
}

function messageHandler(msg) {
	switch (msg.type) {
	case 'scan':
		scanThisPage();
		break;
	}
}

browser.runtime.onMessage.addListener(messageHandler);
scanThisPage();
