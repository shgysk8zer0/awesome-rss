window.addEventListener('DOMContentLoaded', async () => {
	function $(selector, base = document) {
		return [...base.querySelectorAll(selector)];
	}

	function getText(el) {
		const msg = browser.i18n.getMessage(`${el.dataset.localeText}`);
		if (msg !== '') {
			el.textContent = msg;
		}
	}

	function getTitle(el) {
		const msg = browser.i18n.getMessage(`title@${el.dataset.localeTitle}`);
		if (msg !== '') {
			el.title = msg;
		}
	}

	function getPlaceholder(el) {
		const msg = browser.i18n.getMessage(`placeholder@${el.dataset.localePlaceholder}`);
		if (msg !== '') {
			el.placeholder = msg;
		}
	}

	async function setValuesFromStorage({
		storage = browser.storage.sync,
		form = document.forms.options,
		opts
	}) {
		const inputs = $('[name]', form);

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
		});
	}

	const storage = browser.storage.sync;
	const form = document.forms.options;
	const opts = await storage.get();

	setValuesFromStorage({form, storage, opts});

	$('output[for]', form).forEach(output => {
		const input = document.getElementById(output.getAttribute('for'));
		input.addEventListener('input', change => output.textContent = change.target.value);
		output.textContent = input.value;
	});

	$('[name]', form).forEach(input => {
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

	$('[data-locale-text]', form).forEach(getText);
	$('[data-locale-title]', form).forEach(getTitle);
	$('[data-locale-placeholder]', form).forEach(getPlaceholder);

	form.addEventListener('submit', submit => submit.preventDefault());
	form.addEventListener('reset', reset => {
		reset.preventDefault();
		if (confirm('This will clear your settings')) {
			browser.runtime.sendMessage({type: 'resetOpts'});

			setTimeout(async () => {
				setValuesFromStorage({
					form,
					storage,
					opts: await storage.get(),
				});
			}, 500);
		}
	});
	form.hidden = false;
}, {once: true});
