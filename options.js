window.addEventListener('DOMContentLoaded', async () => {
	function $(selector, base = document) {
		return [...base.querySelectorAll(selector)];
	}

	const storage = browser.storage.local;
	const opts = await storage.get();
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
			storage.remove(key);
		}
	});

	document.forms.options.addEventListener('submit', async (submit) => {
		submit.preventDefault();
		const form = new FormData(submit.target);

		[...form.keys()].forEach(key => opts[key] = form.get(key));

		$('input[type="checkbox"]:not(:checked)', submit.target).forEach(input => {
			delete opts[input.name];
			storage.remove(input.name);
		});
		storage.set(opts);
	});

	$('[type="reset"]').forEach(btn => {
		btn.addEventListener('click', click => {
			click.preventDefault();
			if (confirm('This will clear your settings')) {
				btn.closest('form').reset();
				storage.clear();
			}
		});
	});
	document.forms.options.hidden = false;
}, {once: true});
