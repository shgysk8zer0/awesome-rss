browser.runtime.onMessage.addListener(msg => {
	const LINK_TYPES = ['application/rss+xml', 'application/atom+xml'];
	const QUERY = 'link[rel="alternate"]';
	const links = Array.from(document.querySelectorAll(QUERY));
	console.log(msg);
	console.info(links);
	browser.runtime.sendMessage(links.filter(link => {
		return LINK_TYPES.includes(link.type);
	}).map(link => {
		return {type: link.type, href: link.href};
	}));
});
