const storage = browser.storage.local;
const types = {
	RSS: 'application/rss+xml',
	Atom: 'application/atom+xml',
};
function $(query, base = document) {
	return [...base.querySelectorAll(query)];
}
async function init() {
	const opts = await storage.get([
		'template',
		'color',
		'fontFamily',
		'fontSize',
		'feedMargin',
		'feedPadding',
		'bgColor',
		'bgImage',
	]);
	const url = new URL(location.href);
	const links = JSON.parse(url.searchParams.get('links'));
	const container = document.getElementById('feeds-container');
	const template = document.getElementById(opts.template || 'regular-template');
	if (opts.hasOwnProperty('bgColor')) {
		document.documentElement.style.setProperty('--feed-color', opts.color);
	}
	if (opts.hasOwnProperty('fontFamily')) {
		document.documentElement.style.setProperty('--feed-font', opts.fontFamily);
	}
	if (opts.hasOwnProperty('fontSize')) {
		document.documentElement.style.setProperty('--feed-size', `${opts.fontSize}px`);
	}
	if (opts.hasOwnProperty('feedMargin')) {
		document.documentElement.style.setProperty('--feed-margin', `${opts.feedMargin}px`);
	}
	if (opts.hasOwnProperty('feedPadding')) {
		document.documentElement.style.setProperty('--feed-padding', `${opts.feedPadding}px`);
	}
	if (opts.hasOwnProperty('bgColor')) {
		document.documentElement.style.setProperty('--feed-bg-color', opts.bgColor);
	}
	if (opts.hasOwnProperty('bgImage')) {
		document.documentElement.style.setProperty('--feed-bg-image', `url(${opts.bgImage})`);
	}
	console.log(document.documentElement.style);

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
