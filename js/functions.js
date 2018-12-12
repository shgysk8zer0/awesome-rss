import {storage} from './consts.js';

export async function openFeed(click) {
	click.preventDefault();
	console.log(click);

	const opts = await storage.get(['openFeed', 'service']);
	console.log(this);

	browser.runtime.sendMessage({
		type: 'openFeed',
		params: {
			feed: this.url,
			target: opts.openFeed,
			service: opts.service,
		}
	});
}

export function $(selector, base = document) {
	return [...base.querySelectorAll(selector)];
}

export async function ready() {
	await new Promise(resolve => {
		if (['interactive', 'complete'].includes(document.readyState)) {
			resolve();
		} else {
			document.addEventListener('DOMContentLoaded', resolve(), {once: true});
		}
	});
}
