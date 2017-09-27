const storage = browser.storage.local;
const types = {
	RSS: 'application/rss+xml',
	Atom: 'application/atom+xml',
};
function $(query, base = document) {
	return [...base.querySelectorAll(query)];
}
async function init() {
	const opts = await storage.get(['template', 'color', 'fontFamily', 'fontSize']);
	const url = new URL(location.href);
	const links = JSON.parse(url.searchParams.get('links'));
	const container = document.getElementById('feeds-container');
	const template = document.getElementById(opts.template || 'regular-template');
	document.documentElement.style.setProperty('--feed-color', opts.color);
	document.documentElement.style.setProperty('--feed-font', opts.fontFamily);
	document.documentElement.style.setProperty('--feed-size', `${opts.fontSize}px`);

	try {
		links.forEach(link => {
			let feed = template.content.cloneNode(true);
			$('[href]', feed).forEach(node => {
				node.href = link.href;
				node.addEventListener('click', openFeed);
			});
			$('[title]').forEach(node => node.title = link.title);
			$('[data-prop="title"]', feed).forEach(node => node.textContent = link.title);
			$('[data-prop="type"]', feed).forEach(node => {
				node.textContent = Object.keys(types).find(type => link.type === types[type]);
			});
			container.appendChild(feed);
		});
	} catch (error) {
		console.error(error);
	}
}

async function openFeed(click) {
	click.preventDefault();
	const opts = await storage.get('openFeed');
	if (opts.hasOwnProperty('openFeed')) {
		switch (opts.openFeed) {
		case 'window':
			browser.windows.create({url: this.href});
			break;
		case 'tab':
			browser.tabs.create({url: this.href});
			break;
		case 'current':
			browser.tabs.update(null, {url: this.href});
			break;
		default:
			throw new Error(`Unsupported open feed method: ${opts.openFeed}`);
		}
	} else {
		browser.tabs.update(null, {url: this.href});
	}
}

if (['interactive', 'complete'].includes(document.readyState)) {
	init();
} else {
	document.addEventListener('DOMContentLoaded', init, {once: true});
}
