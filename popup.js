function init() {
	const url = new URL(location.href);
	const links = JSON.parse(url.searchParams.get('links'));
	const container = document.body;

	try {
		links.forEach((link, index) => {
			let feed = document.createElement('a');
			feed.href = link.href;
			feed.textContent = link.title;
			feed.target = '_blank';
			container.appendChild(feed);
			if (links.length - 1 > index) {
				container.appendChild(document.createElement('br'));
			}
		});
	} catch (error) {
		console.error(error);
	}

}
if (['interactive', 'complete'].includes(document.readyState)) {
	init();
} else {
	document.addEventListener('DOMContentLoaded', init, {once: true});
}
init();
