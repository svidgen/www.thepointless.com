(() => {
	const PROFILE_VERSION = 1;
	const STORAGE_KEY = 'frentagonist.profile.v1';
	const dimensions = {
		'Name': 'string',
		'Your Political Leaning': ['Leftist', 'Progressive', 'Mixed', 'Conservative', 'Alt-Right'],
		'Your Ideal State Structure': ['Anarchist', 'Libertarian', 'Mixed', 'Socialist', 'Totalitarian'],
		'Your Religiousness': ['Atheistic', 'Agnostic', 'Casual', 'Devout', 'Fundamentalist'],
		'Academic Style': ['Liberal Arts', 'Theoretical Science', 'Youtube+Wikipedia', 'Applied Science', 'Trade School'],
		'Alcohol': ['Water', 'Wine', 'Scotch', 'Beer', 'Vodka'],
		'Socialization Style': ['Super Introvert', 'Introvert', 'Ambivert', 'Extrovert', 'Super Extrovert'],
		'Preferred Discussion': ['Pretty Clouds', 'Weather', 'News/Gossip', 'Hobbies', 'Politics and Religion'],
	};

	const app = document.querySelector('[data-frentagonist-app]');
	if (!app) return;

	function encode(profile) {
		return btoa(unescape(encodeURIComponent(JSON.stringify({ v: PROFILE_VERSION, p: profile }))));
	}

	function decode(value) {
		try {
			const decoded = JSON.parse(decodeURIComponent(escape(atob(value))));
			return decoded && decoded.v === PROFILE_VERSION ? decoded.p : null;
		} catch {
			return null;
		}
	}

	function loadLocalProfile() {
		try {
			return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
		} catch {
			return null;
		}
	}

	function saveLocalProfile(profile) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
	}

	function linkedProfile() {
		return decode(new URL(location.href).searchParams.get('s') || '');
	}

	function shareUrl(profile) {
		const url = new URL(location.href);
		url.searchParams.set('s', encode(profile));
		return url.href;
	}

	function compatibility(theirs, yours) {
		let total = 0;
		let score = 0;
		for (const [dimension, values] of Object.entries(dimensions)) {
			if (!Array.isArray(values)) continue;
			total += 4;
			score += 4 - Math.abs(values.indexOf(theirs[dimension]) - values.indexOf(yours[dimension]));
		}
		return Math.round((score / total) * 100);
	}

	function shareString(profile) {
		return Object.entries(dimensions).map(([dimension, values]) => {
			if (dimension === 'Name') return profile.Name;
			if (!Array.isArray(values)) return '';
			let found = false;
			return values.map(value => {
				if (value === profile[dimension]) {
					found = true;
					return '✅';
				}
				return found ? '🟦' : '🟥';
			}).join('');
		}).filter(Boolean).join('\n');
	}

	function renderEditor(values = {}) {
		app.innerHTML = '<ft:editprofile><h3>Create Your Profile</h3><div>Fill out your profile to see how frentagonistic you are with someone. You do <i>not</i> need to create an account. We will give you a sharable link.</div><h4 data-warning>All fields are required.</h4><form data-profile-form></form></ft:editprofile>';
		const form = app.querySelector('[data-profile-form]');
		for (const [dimension, options] of Object.entries(dimensions)) {
			const field = document.createElement('ft:editdimension');
			field.dataset.dimension = dimension;
			field.innerHTML = `<div data-id="label">${dimension}</div><div data-id="options"></div>`;
			const optionsEl = field.querySelector('[data-id="options"]');
			if (options === 'string') {
				const input = document.createElement('input');
				input.name = dimension;
				input.value = values[dimension] || '';
				input.setAttribute('aria-label', dimension);
				optionsEl.append(input);
			} else {
				options.forEach(option => {
					const id = `${dimension}-${option}`.replace(/[^a-z0-9]+/gi, '-');
					const wrapper = document.createElement('ft:radio');
					wrapper.innerHTML = `<input id="${id}" type="radio" name="${dimension}" value="${option}"><label for="${id}">${option}</label>`;
					if (values[dimension] === option) wrapper.querySelector('input').checked = true;
					optionsEl.append(wrapper);
				});
			}
			form.append(field);
		}
		const save = document.createElement('button');
		save.type = 'submit';
		save.textContent = 'Save';
		form.append(save);
		form.addEventListener('submit', event => {
			event.preventDefault();
			const data = new FormData(form);
			const profile = {};
			let hasErrors = false;
			for (const dimension of Object.keys(dimensions)) {
				profile[dimension] = String(data.get(dimension) || '').trim();
				const field = form.querySelector(`[data-dimension="${dimension}"]`);
				field.style.color = profile[dimension] ? '' : 'red';
				hasErrors = hasErrors || !profile[dimension];
			}
			app.querySelector('[data-warning]').style.color = hasErrors ? 'red' : '';
			if (!hasErrors) {
				saveLocalProfile(profile);
				renderProfile(profile);
			}
		});
	}

	function renderProfile(profile) {
		const linked = linkedProfile();
		const link = shareUrl(profile);
		app.innerHTML = '<div data-id="editControl"><button type="button" data-edit>Edit Profile</button></div><ft:profileview></ft:profileview>';
		app.querySelector('[data-edit]').addEventListener('click', () => renderEditor(profile));
		const view = app.querySelector('ft\\:profileview');
		if (linked) {
			const percent = compatibility(linked, profile);
			view.innerHTML = `<h3>Frentagonist Comparison</h3><p><strong>${linked.Name}</strong> and <strong>${profile.Name}</strong> are <strong>${percent}%</strong> frentagonistically aligned.</p><p>${percent > 75 ? 'Proceed with cautious friendship.' : percent > 45 ? 'This could be friendship or archrivalry. Further forms are required.' : 'Archrival potential detected.'}</p>`;
		} else {
			view.innerHTML = `<h3>${profile.Name}'s Frentagonist Profile</h3><div data-profile-rows></div><div data-id="actions"><p><label>Share link<br><input data-share-link readonly value="${link}"></label></p><p><label>Share glyphs<br><textarea data-share-string readonly>${shareString(profile)}</textarea></label></p></div>`;
			const rows = view.querySelector('[data-profile-rows]');
			for (const [dimension, value] of Object.entries(profile)) {
				const row = document.createElement('ft:dimensionview');
				row.innerHTML = `<strong>${dimension}</strong><span>${value}</span>`;
				rows.append(row);
			}
		}
	}

	const saved = loadLocalProfile();
	if (saved) renderProfile(saved);
	else renderEditor();
})();
