const TABS = {};
const defaultOpts = {
	icon:        'light',
	openFeed:    'current',
	service:     'rss',
	template:    'regular-template',
	color:       '#101010',
	fontFamily:  'Arial, Helvetica, sans-serif',
	fontSize:    14,
	feedMargin:  0,
	feedPadding: 7,
	bgColor:     '#ffffff',
	nextcloudUrl: '',
	tinyTinyRssUrl: '',
	freshRssUrl: '',
};

const storage = browser.storage.sync;

const ICONS = {
	light:    'icons/subscribe-64.svg',
	dark:     'icons/subscribe-dark-64.svg',
	orange:   'icons/subscribe-orange-64.svg',
	green:    'icons/subscribe-green-64.svg',
	disabled: 'icons/subscribe-disabled.svg',
};

async function openFeed({feed, target = 'current', service = 'rss', index = undefined} = {}) {
	let url = null;
	const opts = await storage.get(['nextcloudUrl','tinyTinyRssUrl','freshRssUrl']);
	console.info(opts);

	switch (service) {
	case 'feedly':
		const feedly = new URL('https://feedly.com/i/subscription/feed/');
		feedly.pathname += encodeURIComponent(feed);
		url = feedly;
		break;
	case 'inoreader':
		url = new URL('https://www.inoreader.com');
		url.searchParams.set('add_feed', feed);
		break;
	case 'tinyTinyRss':
		url = new URL('public.php', opts.tinyTinyRssUrl);
		url.searchParams.set('op', 'subscribe');
		url.searchParams.set('feed_url', feed);
		break;
	case 'nextcloud':
		url = new URL('apps/news', opts.nextcloudUrl);
		url.searchParams.set('subscribe_to', feed);
		break;
	case 'freshRss':
		url = new URL('i', opts.freshRssUrl);
		url.searchParams.set('c', 'feed');
		url.searchParams.set('a', 'add');
		url.searchParams.set('url_rss', feed);
		break;
	default:
		url = new URL(feed);
	}

	console.info(url);

	switch (target) {
	case 'window':
		browser.windows.create({url: url.toString()});
		break;

	case 'tab':
		browser.tabs.create({
			url: url.toString(),
		});
		break;

	case 'next':
		browser.tabs.create({
			url: url.toString(),
			index,
		});
		break;

	case 'current':
		browser.tabs.update(null, {url: url.toString()});
		break;

	default:
		throw new Error(`Unsupported open feed method: ${target}`);
	}
}

async function clickHandler(tab) {
	const opts = await storage.get(['openFeed', 'service']);
	const index = opts.openFeed === 'next' ? tab.index + 1 : null;

	try {
		openFeed({
			feed: TABS[tab.id][0].href,
			target: opts.openFeed,
			service: opts.service,
			index,
		});
	} catch (err) {
		/* eslint no-console: 0 */
		console.error(err);
	}
}

async function optChange(opts) {
	if (opts.hasOwnProperty('icon') && opts.icon.newValue !== opts.icon.oldValue) {
		let icon = opts.icon.newValue;

		if (! ICONS.hasOwnProperty(icon)) {
			icon = ICONS[defaultOpts.icon];
		} else {
			icon = ICONS[icon];
		}

	browser.pageAction.setIcon({
					path: icon,
				});
	}
}

async function updateHandler(update) {
	if (update.temporary) {
		/* eslint no-console: 0 */
		const opts = await storage.get();
		console.log({update, opts});
	}

	if (update.reason === 'install') {
		storage.set(defaultOpts);
	} else if (update.reason === 'update') {
		/*eslint no-fallthrough: "off"*/
		/*eslint no-case-declarations: "off"*/
		let opts = await storage.get();
		const localOpts = await browser.storage.local.get();

		switch (update.previousVersion) {
		case '1.0.0':
		case '1.0.1':
			if (localOpts.hasOwnProperty('icon')) {
				const key = Object.keys(ICONS).find(icon => {
					return ICONS[icon] === opts.icon.replace('16', '64');
				});
				localOpts.icon = ICONS.hasOwnProperty(key) ? key : defaultOpts.icon;
			} else {
				localOpts.icon = defaultOpts.icon;
			}
			if (! opts.hasOwnProperty('openFeed')) {
				opts.openFeed = defaultOpts.openFeed;
			}

		case '1.0.2':
			localOpts.template = defaultOpts.template;
			localOpts.fontFamily = defaultOpts.fontFamily;
			localOpts.fontSize = defaultOpts.fontSize;
			localOpts.feedMargin = defaultOpts.feedMargin;
			localOpts.feedPadding = defaultOpts.feedPadding;
			localOpts.bgColor = defaultOpts.bgColor;

		case '1.1.0':
			Object.keys(opts).forEach(key => localOpts[key] = opts[key]);
			storage.set(localOpts);
			browser.storage.local.clear();

		case '1.1.3':
			storage.set({service: defaultOpts.service});
		case '1.3.0':
			storage.set({
				nextcloudUrl: '',
				tinyTinyRssUrl: '',
			});
		case '1.3.5':
			storage.set({freshRssUrl: ''});
		}
	}
}

browser.storage.onChanged.addListener(optChange);
browser.runtime.onInstalled.addListener(updateHandler);
