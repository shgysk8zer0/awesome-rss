window.addEventListener('DOMContentLoaded', async () => {
	function $(selector, base = document) {
		return [...base.querySelectorAll(selector)];
	}

	const storage = browser.storage.local;
	const opts = await storage.get();
	const form = document.forms.options;
	const inputs = $('[name]', form);

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
			storage.remove(key);
		}
	});

	inputs.forEach(input => {
		input.addEventListener('change', change => {
			if (change.target instanceof HTMLInputElement) {
				switch (change.target.type) {
				case 'checkbox':
					opts[change.target.name] = change.target.checked;
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
