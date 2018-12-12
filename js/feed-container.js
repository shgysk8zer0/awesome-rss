import './feed-item.js';

export default class HTMLFeedOptionsElement extends HTMLDivElement {
	constructor() {
		super();
		const slot = document.createElement('slot');
		const style = document.createElement('style');
		style.href = new URL('/css/popup.css', document.baseURI).href;
		slot.name = 'feeds';
		slot.textContent = 'No feeds available';
		this.attachShadow({mode: 'open'});
		this.shadowRoot.append(style);
		this.shadowRoot.append(slot);
	}

	toJSON() {
		return this.feeds;
	}

	set feeds(opts) {
		const feeds = opts.map(opt => {
			const feed = document.createElement('div', {is: 'feed-item'});
			feed.url = opt.href;
			feed.template = 'underline';
			feed.title = opt.title;
			feed.text = opt.title;
			feed.slot = 'feeds';
			feed.classList.add('panel-list-item');
			return feed;
		});
		this.clear();
		this.append(...feeds);
	}

	get feeds() {
		return [...this.shadowRoot.querySelector('slot[name="feeds"]').assignedNodes()];
	}

	clear() {
		this.feeds.forEach(el => el.remove());
	}
}

customElements.whenDefined('feed-item').then(() => {
	customElements.define('feed-container', HTMLFeedOptionsElement, {extends: 'div'});
});
