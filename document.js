function messageHandler(tab) {
	const LINK_TYPES = ['application/rss+xml', 'application/atom+xml'];
	const QUERY = 'link[rel="alternate"][type]';
	const links = Array.from(document.querySelectorAll(QUERY));

	tab.links = links.filter(link => {
		return LINK_TYPES.includes(link.type);
	}).map(link => {
		return {
			type: link.type,
			href: link.href,
			title: link.title || link.href
		};
	});
	browser.runtime.sendMessage(tab);
}

function pingExt() {
	browser.runtime.sendMessage('ready');
	document.removeEventListener('DOMContentLoaded', pingExt);
}

browser.runtime.onMessage.addListener(messageHandler);

if (document.readyState === 'complete') {
	pingExt();
} else {
	document.addEventListener('DOMContentLoaded', pingExt);
}
