customElements.define('error-message', class HTMLErrorMessageElement extends HTMLElement {
	constructor() {
		super();
		const url = new URL(location.href);
		const feed = url.searchParams.get('feed');
		const template = document.getElementById('error-message-template').content.cloneNode(true);
		this.attachShadow({mode: 'open'});
		this.shadowRoot.append(template);
		this.feedUrl = feed;
		this.errorMessage = 'This does not work anymore';
		console.log(this);
	}

	set feedUrl(url) {
		const a = document.createElement('a');
		a.href = url;
		a.textContent = 'here';
		a.slot = 'feed';
		a.classList.add('feed');
		[...this.querySelectorAll('.feed')].forEach(el => el.remove());
		this.append(a);
	}

	get feedUrl() {
		return this.querySelector('.feed').href;
	}

	set errorMessage(msg) {
		const p = document.createElement('p');
		p.textContent = msg;
		p.classList.add('error');
		p.slot = 'error';
		[...this.querySelectorAll('.error')].forEach(el => el.remove());
		this.append(p);
	}

	get errorMessage() {
		return this.querySelector('.error').textContent;
	}
});
