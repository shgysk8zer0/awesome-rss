function init() {
	const url = new URL(location.href);
	const links = JSON.parse(url.searchParams.get('links'));
	const container = document.getElementById('feeds-container');
	const template = document.getElementById('feed-template');

	try {
		links.forEach(link => {
			let feed = template.content.cloneNode(true);
			let a = feed.querySelector('a');
			a.href = link.href;
			a.title = link.title;
			a.type = link.type;
			feed.querySelector('[data-prop="title"]').textContent = link.title;
			container.appendChild(feed);
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
