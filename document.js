function filterLink(link) {
	const LINK_TYPES = ['application/rss+xml', 'application/atom+xml'];
	return LINK_TYPES.includes(link.type);
}

function mapLink(link) {
	return {
		type: link.type,
		href: link.href,
		title: link.title || link.href
	};
}

function messageHandler(tab) {
	const QUERY = 'link[rel="alternate"][type]';
	const LINKS = Array.from(document.querySelectorAll(QUERY));

	tab.links = LINKS.filter(filterLink).map(mapLink);
	browser.runtime.sendMessage(tab);
}

function pingExt() {
	browser.runtime.sendMessage('ready');
}

browser.runtime.onMessage.addListener(messageHandler);

if (document.readyState === 'complete') {
	pingExt();
} else {
	document.addEventListener('DOMContentLoaded', pingExt, {once: true});
}
