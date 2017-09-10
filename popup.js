//document.addEventListener('load', () => {
	console.log('Hello world');
	const params = new URLSearchParams(location.search);
	const links = JSON.parse(params.get('links'));
	links.forEach(link => {
		let feed = document.createElement('a');
		feed.href = link.href;
		feed.target = '_blank';
		feed.textContent = link.title;
		document.body.appendChild(feed);
		document.body.appendChild(document.createElement('br'));
	});
//});
