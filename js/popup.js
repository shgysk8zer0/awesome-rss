import './feed-container.js';
import {storage} from './consts.js';
import {ready} from './functions.js';

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

	const url = new URL(location.href);
	const container = document.createElement('div', {is: 'feed-container'});
	const panel = document.createElement('div');
	panel.classList.add('panel');
	container.feeds = JSON.parse(url.searchParams.get('links'));
	container.classList.add('panel-section', 'panel-section-list');
	container.id = 'feeds-container';
	panel.append(container);
	document.body.append(panel);
}

ready().then(async () => {
	await customElements.whenDefined('feed-container');
	init();
} );
