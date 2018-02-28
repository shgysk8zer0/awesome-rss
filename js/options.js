window.addEventListener('DOMContentLoaded', async () => {
	function $(selector, base = document) {
		return [...base.querySelectorAll(selector)];
	}

	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/getMessage
	function i18n(strings, el) {
		let prefix = strings[0];
		let id = '';
		switch (prefix) {
		case 'title':
			id = el.dataset.localeTitle;
			break;
		default:
			id = el.dataset.localeText;
			break;
		}
		return browser.i18n.getMessage(`${prefix}${id.charAt(0).toUpperCase()}${id.substr(1)}`);
	}

	const storage = browser.storage.sync;
	const opts = await storage.get();
	const form = document.forms.options;
	const inputs = $('[name]', form);

	$('[data-locale-text]', form).forEach(el => el.textContent = i18n`text${el}`);
	$('[data-locale-title]', form).forEach(el => el.title = i18n`title${el}`);

	Object.entries(opts).forEach(([key, value]) => {
		const matches = inputs.filter(el => el.name === key);
		matches.forEach(input => {
			if (input instanceof HTMLInputElement) {
				switch(input.type) {
				case 'checkbox':
					input.checked = true;
					break;
				case 'radio':
					if (input.value === value) {
						input.checked = true;
					}
					break;
				default:
					input.value = opts[key];
				}
			} else if (input instanceof HTMLSelectElement) {
				input.value = opts[key];
			} else {
				storage.remove(key);
			}
		});


		$('output[for]', form).forEach(output => {
			const input = document.getElementById(output.getAttribute('for'));
			input.addEventListener('input', change => output.textContent = change.target.value);
			output.textContent = input.value;
		});
	});

	inputs.forEach(input => {
		input.addEventListener('change', change => {
			if (change.target instanceof HTMLInputElement) {
				switch (change.target.type) {
				case 'checkbox':
				case 'radio':
					opts[change.target.name] = change.target.value;
					break;
				default:
					opts[change.target.name] = change.target.value;
				}
			} else if (change.target instanceof HTMLSelectElement) {
				opts[change.target.name] = change.target.value;
			}
			storage.set(opts);
		});
	});

	form.addEventListener('submit', submit => submit.preventDefault());
	form.addEventListener('reset', reset => {
		if (confirm('This will clear your settings')) {
			storage.clear();
		} else {
			reset.preventDefault();
		}
	});
	form.hidden = false;
}, {once: true});
