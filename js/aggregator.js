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

		return Promise.all(this.feeds.map(async feed => {
			try {
				const url = new URL(feed.url);
				const resp = await fetch(url, {
					mode: 'cors',
				});

				if (resp.ok) {
					const xml = await resp.text();
					const doc = parser.parseFromString(xml, 'application/xml');
					const feedTmp = feedTemplate.cloneNode(true);
					const list = feedTmp.querySelector('[data-field="items"]');

					$('[data-field="title"]', feedTmp).forEach(title => title.textContent = feed.title);
					$('a', feedTmp).forEach(a => a.href = new URL(doc.querySelector('channel > link').textContent, url.origin));
					$('item', doc).forEach(item => {
						// item.dataset.feedUrl = feed.url;
						const tmp = feedItemTemplate.cloneNode(true);
						const title = item.querySelector('title');
						const link = item.querySelector('link');

						$('a', tmp).forEach(a => a.href = new URL(link.textContent, url.origin));
						$('[data-field="title"]', tmp).forEach(feedTitle => feedTitle.textContent = title.textContent);
						list.append(tmp);
					});
					return feedTmp;
				} else {
					throw new Error(`${resp.url} [${resp.status} ${resp.statusText}]`);
				}
			} catch(err) {
				console.error(err);
				return '';
			}
		}));
	}

	async save() {
		return browser.storage.sync.set({feeds: this.feeds});
	}
}


function $(selector, base = document) {
	return [...base.querySelectorAll(selector)];
}

window.addEventListener('DOMContentLoaded', async () => {
	const list = await FeedList.init();
	list.add({
		title: 'Chris Zuber RSS',
		url: 'https://shgysk8zer0.github.io/feed.rss',
	});

	const feeds = await list.parse();

	document.getElementById('container').append(...feeds);
});
