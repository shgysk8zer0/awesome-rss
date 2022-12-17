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
		url.searchParams.set('op', 'bookmarklets--subscribe');
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

function removeHandler(tabId) {
	delete TABS[tabId];
}

async function updatePageAction(tab, links) {
	if (links.length > 0) {
		const opts = await storage.get('icon');
		TABS[tab.id] = links.map(link => {
			link.tabId = tab.id;
			return link;
		});

		if (! ICONS.hasOwnProperty(opts.icon)) {
			opts.icon = defaultOpts.icon;
		}

		browser.pageAction.setIcon({
			tabId: tab.id,
			path: ICONS[opts.icon]
		});

		browser.pageAction.setTitle({
			tabId: tab.id,
			title: browser.i18n.getMessage('pageActionTooltip'),
		});

		browser.pageAction.show(tab.id);
	}

	if (links.length === 1) {
		browser.pageAction.onClicked.addListener(clickHandler);
	} else if (links.length > 1) {
		const url = new URL(browser.runtime.getURL('popup.html'));

		url.searchParams.set('links', JSON.stringify(links));
		browser.pageAction.setPopup({
			tabId: tab.id,
			popup: url.toString()
		});
	}
}

async function messageHandler(msg, sender) {
	switch (msg.type) {
	case 'feeds':
		updatePageAction(sender.tab, msg.links);
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

function scanPage(tab) {
	const tabId = typeof(tab) === 'number' ? tab : tab.id || tab.tabId;
	browser.pageAction.setIcon({
		tabId: tabId,
		path: ICONS.disabled,
	});

	browser.pageAction.setTitle({
		tabId: tabId,
		title: browser.i18n.getMessage('extensionNA'),
	});

	browser.tabs.sendMessage(tabId, {type: 'scan'}).catch(() => {});
}

async function refreshAllTabsPageAction() {
	const tabs = await browser.tabs.query({});
	tabs.forEach(scanPage);
}

async function optChange(opts) {
	if (opts.hasOwnProperty('icon') && opts.icon.newValue !== opts.icon.oldValue) {
		const tabs = await browser.tabs.query({status: 'complete'});
		let icon = opts.icon.newValue;

		if (! ICONS.hasOwnProperty(icon)) {
			icon = ICONS[defaultOpts.icon];
		} else {
			icon = ICONS[icon];
		}

		tabs.forEach(async tab => {
			/**
			 * Since we do not want to rescan the page to know if there are feeds
			 * and there is no `getIcon` method, check the title to know if we
			 * can update the icon without implying that there is a feed to
			 * subscribe to.
			*/
			const title = await browser.pageAction.getTitle({tabId: tab.id});

			if (title !== browser.i18n.getMessage('extensionNA')) {
				browser.pageAction.setIcon({
					tabId: tab.id,
					path: icon,
				});
			}
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

browser.runtime.onMessage.addListener(messageHandler);
browser.tabs.onRemoved.addListener(removeHandler);
browser.tabs.onUpdated.addListener(scanPage);
browser.storage.onChanged.addListener(optChange);
browser.runtime.onInstalled.addListener(updateHandler);
refreshAllTabsPageAction();
