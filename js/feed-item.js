import {openFeed} from './functions.js';

export default class HTMLFeedItemElement extends HTMLDivElement {
	constructor() {
		super();
		this.attachShadow({mode: 'open'});
		const slot = document.createElement('slot');
		slot.name = 'text';
		slot.textContent = 'Untitled Feed';
		this.shadowRoot.appendChild(slot);
		this.addEventListener('click', openFeed);
	}

	toString() {
		return this.text;
	}

	toJSON() {
		return {
			url: this.url,
			text: this.text,
			type: this.type,
		};
	}

	get container() {
		switch (this.template) {
		case 'bold':
			return document.createElement('b');
		case 'italic':
			return document.createElement('i');
		case 'underline':
			return document.createElement('u');
		default:
			return document.createElement('span');
		}
	}

	set url(url) {
		this.setAttribute('url', url);
	}

	get url() {
		return this.getAttribute('url');
	}

	set text(text) {
		const el = this.container;
		el.style.setProperty('display', 'block');
		el.slot = 'text';
		el.textContent = text;
		// this.append(el);
	}

	get text() {
		const slot = this.shadowRoot.querySelector('slot[name="text"]');
		const nodes = slot.assignedNodes();
		if (nodes.length === 1) {
			return nodes[0].textContent;

		}
	}

	get template() {
		return this.getAttribute('template') || 'regular';
	}

	set template(template) {
		this.setAttribute('template', template);
	}

	get type() {
		return this.getAttribute('type');
	}

	set type(type) {
		this.setAttribute('type', type);
	}
}

customElements.define('feed-item', HTMLFeedItemElement, {extends: 'div'});
