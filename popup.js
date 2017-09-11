if (document.readyState === 'complete') {
	init();
} else {
	document.addEventListener('load', init);
}
init();
function init() {
	const url = new URL(location.href);
	const links = JSON.parse(url.searchParams.get('links'));
	const container = document.createElement('div');
	document.removeEventListener('load', init);
	try {
		links.forEach(link => {
			let feed = document.createElement('a');
			feed.href = link.href;
			feed.textContent = link.title;
			feed.target = '_blank';
			container.appendChild(feed);
		});
	} catch (error) {
		console.error(error);
	} finally {
		console.info(container.innerHTML);
	}

}
