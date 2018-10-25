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

	function proxyEvent(target) {
		return (event) => {
			if (! event.target.classList.contains('proxied-event')) {
				event.target.classList.add('proxied-event');
				target.dispatchEvent(new Event(event.type));
				setTimeout(() => event.target.classList.remove('proxied-event'), 100);
			}
		};
	}

	async function inputToggle(field) {
		if (field instanceof Event) {
			field = field.target;
		}
		$(`[name="${field.dataset.enables}"]`, field.closest('form')).forEach(input => {
			input.disabled = ! field.checked;
			input.hidden = ! field.checked;
			input.required = field.checked;
			Array.from(input.labels).forEach(label => label.hidden = ! field.checked);
		});
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
						if (input.dataset.hasOwnProperty('enables')) {
							inputToggle(input);
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
			let skip = false;
			if (change.target instanceof HTMLInputElement) {
				switch (change.target.type) {
				case 'checkbox':
				case 'radio':
					if (change.target.type === 'checkbox' || change.target.checked) {
						opts[change.target.name] = change.target.value;
					} else {
						skip = true;
					}
					break;
				default:
					opts[change.target.name] = change.target.value;
				}
			} else if (change.target instanceof HTMLSelectElement) {
				opts[change.target.name] = change.target.value;
			}
			if (! skip) {
				storage.set(opts);
			}
		});
	});

	$('[data-enables]', form).forEach(field => {
		const proxChangeHandler = proxyEvent(field);
		field.addEventListener('change', inputToggle);
		const proxies = $(`[name="${field.name}"]:not([data-enables="${field.dataset.enables}"])`, form);
		proxies.forEach(proxy => {
			proxy.addEventListener('change', proxChangeHandler);
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
