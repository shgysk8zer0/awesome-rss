const storage = browser.storage.sync;
const types = {
	RSS: 'application/rss+xml',
	Atom: 'application/atom+xml',
};
function $(query, base = document) {
	return [...base.querySelectorAll(query)];
}

async function render(links) {
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

        try {
                container.innerHTML = "";
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
		/* eslint no-console: 0 */
		console.error(error);
	}
}

async function openFeed(click) {
	click.preventDefault();

	const opts = await storage.get(['openFeed', 'service']);

	browser.runtime.sendMessage({
		type: 'openFeed',
		params: {
			feed: this.href,
			target: opts.openFeed,
			service: opts.service,
		}
	});
}

async function messageHandler(msg, sender) {
	switch (msg.type) {
	case 'feeds':
	        render(msg.links);
		break;

	case 'openFeed':
		if (msg.params.target === 'next') {
			const tabs = await browser.tabs.query({active: true, currentWindow: true});
			if (tabs.length === 1) {
				const tab = tabs[0];
				msg.params.index = tab.index + 1;
			}
		}
		openFeed(msg.params);
		break;

	case 'resetOpts':
		storage.set(defaultOpts);
		break;
	}
}

browser.runtime.onMessage.addListener(messageHandler);

// TODO Learn JS conventions on indentation...
browser.tabs.query({active: true, currentWindow: true}, tabs => {
    browser.tabs.executeScript(tabs[0].id, {file: "/js/document.js"})
	.then(() => {
	    browser.tabs.sendMessage(tabs[0].id, {type: 'scan'})
		.catch((e) => { console.log(e);});
    }, e => { console.log(e); });
});
