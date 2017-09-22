window.addEventListener('DOMContentLoaded', () => {
	function $(selector, base = document) {
		return Array.from(base.querySelectorAll(selector));
	}
	browser.storage.local.get().then(opts => {
		const inputs = $('[name]', document.forms.options);
		Object.keys(opts).forEach(key => {
			const input = inputs.find(el => el.name === key);
			if (input instanceof HTMLInputElement) {
				switch(input.type) {
				case 'checkbox':
					input.checked = true;
					break;
				default:
					input.value = opts[key];
				}
			} else if (input instanceof HTMLSelectElement) {
				input.value = opts[key];
			} else {
				browser.storage.local.remove(key);
			}
		});
	});

	document.forms.options.addEventListener('submit', async (submit) => {
		submit.preventDefault();
		const form = new FormData(submit.target);
		const opts = await browser.storage.local.get();

		[...form.keys()].forEach(key => {
			opts[key] = form.get(key);
		});
		$('input[type="checkbox"]', submit.target).forEach(input => {
			if (! input.checked) {
				delete opts[input.name];
				browser.storage.local.remove(input.name);
			}
		});
		browser.storage.local.set(opts);
	});
	$('[type="reset"]').forEach(btn => {
		btn.addEventListener('click', () => browser.storage.local.clear());
	});
	document.forms.options.hidden = false;
}, {once: true});
