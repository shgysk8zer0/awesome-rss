customElements.define('feed-link', class HTMLFeedLinkElement extends HTMLAnchorElement {
	connectedCallback() {
		this.href = new URL(location.href).searchParams.get('feed');
	}
}, {extends: 'a'});
