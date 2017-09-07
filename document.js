browser.runtime.onMessage.addListener(tab => {
	const LINK_TYPES = ['application/rss+xml', 'application/atom+xml'];
	const QUERY = 'link[rel="alternate"][type]';
	const links = Array.from(document.querySelectorAll(QUERY));

	tab.links = links.filter(link => {
		return LINK_TYPES.includes(link.type);
	}).map(link => {
		return {type: link.type, href: link.href};
	});
	browser.runtime.sendMessage(tab);
});
