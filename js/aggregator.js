class FeedList {
	constructor(feeds = []) {
		this.feeds = feeds;
	}

	static async init() {
		const opts = await browser.storage.sync.get('feeds');
		return new FeedList(opts.feeds);
	}

	has({url}) {
		return this.feeds.some(feed => feed.url === url);
	}

	async add({title, url}, save = true) {
		if (! this.has({url})) {
			this.feeds.push({title, url});
			if (save) {
				await this.save();
			}
			return true;
		} else {
			return false;
		}
	}

	async remove({url}, save = true) {
		const index = this.feeds.findIndex(feed => feed.url = url);

		if (index !== -1){
			delete this.feeds[index];
			this.feeds = this.feeds.filter(Number.isInteger);
			if (save) {
				await this.save();
			}
			return true;
		} else {
			return false;
		}
	}

	async parse() {
		const parser = new DOMParser();
		const feedItemTemplate = document.getElementById('feed-item-template').content;
		const feedTemplate = document.getElementById('feed-template').content;

		async function listOpenToggleHandler(event) {
			const container = event.target.closest('details');
			const list = container.querySelector('[data-field="items"]');

			if (container.open) {
				container.classList.add('loading');
				const url = new URL(container.dataset.feedUrl);
				const resp = await fetch(url, {
					mode: 'cors',
				});

				if (resp.ok) {
					const xml = await resp.text();
					const doc = parser.parseFromString(xml, 'application/xml');

					$('item', doc).forEach(item => {
						const tmp = feedItemTemplate.cloneNode(true);
						const title = item.querySelector('title');
						const link = item.querySelector('link');

						$('a', tmp).forEach(a => a.href = new URL(link.textContent, url.origin));
						$('[data-field="title"]', tmp).forEach(feedTitle => feedTitle.textContent = title.textContent);
						list.append(tmp);
					});
					container.classList.remove('loading');
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			} else {
				[...list.children].forEach(child => child.remove());
			}
		}

		return this.feeds.map(feed => {
			try {
				const feedTmp = feedTemplate.cloneNode(true);
				$('[data-field="title"]', feedTmp).forEach(el => el.textContent = feed.title);
				$('[data-feed-url]', feedTmp).forEach(details => {
					details.dataset.feedUrl = feed.url;
					details.addEventListener('toggle', listOpenToggleHandler);
				});
				return feedTmp;
			} catch(err) {
				console.error(err);
				return '';
			}
		});
	}

	async save() {
		return browser.storage.sync.set({feeds: this.feeds});
	}
}

function $(selector, base = document) {
	return [...base.querySelectorAll(selector)];
}

async function ready() {
	if (document.readyState === 'loading') {
		await new Promise(resolve => {
			document.addEventListener('DOMContentLoaded', () => resolve(), {once: true});
		});
	}
}

ready().then(async () => {
	const list = await FeedList.init();
	const feeds = await list.parse();

	document.getElementById('container').append(...feeds);
});
