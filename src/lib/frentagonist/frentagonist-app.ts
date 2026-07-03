import { html, id } from 'wirejs-dom/v2';
import { dimensions, STORAGE_KEY, type Profile } from './dimensions';
import { compatibility, decode, encode, shareString } from './profile';
import { FrentagonistShareWidgets } from './share-widgets';

function linkedProfile() {
	return decode(new URL(location.href).searchParams.get('s'));
}

function loadLocalProfile(): Profile | null {
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
	} catch {
		return null;
	}
}

function saveLocalProfile(profile: Profile) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

function shareUrl(profile: Profile) {
	const url = new URL(location.href);
	url.searchParams.set('s', encode(profile));
	return url.href;
}

function ProfileRows(profile: Profile) {
	return html`<div data-profile-rows>
		${Object.entries(profile).map(([dimension, value]) => html`<ft:dimensionview><strong>${dimension}</strong><span>${value}</span></ft:dimensionview>`)}
	</div>`;
}

function ProfileView(profile: Profile, edit: () => void) {
	const linked = linkedProfile();
	const self = html`<div>
		<div data-id='editControl'><button type='button' ${id('edit')}>Edit Profile</button></div>
		<ft:profileview>
			${linked
				? ComparisonView(linked, profile)
				: html`<div>
					<h3>${profile.Name}'s Frentagonist Profile</h3>
					${ProfileRows(profile)}
					${FrentagonistShareWidgets({ link: shareUrl(profile), glyphs: shareString(profile) })}
				</div>`}
		</ft:profileview>
	</div>`;
	self.data.edit.addEventListener('click', edit);
	return self;
}

function ComparisonView(linked: Profile, profile: Profile) {
	const percent = compatibility(linked, profile);
	return html`<div>
		<h3>Frentagonist Comparison</h3>
		<p><strong>${linked.Name}</strong> and <strong>${profile.Name}</strong> are <strong>${percent}%</strong> frentagonistically aligned.</p>
		<p>${percent > 75 ? 'Proceed with cautious friendship.' : percent > 45 ? 'This could be friendship or archrivalry. Further forms are required.' : 'Archrival potential detected.'}</p>
	</div>`;
}

function Editor(values: Partial<Profile>, saveProfile: (profile: Profile) => void) {
	const self = html`<ft:editprofile>
		<h3>Create Your Profile</h3>
		<div>Fill out your profile to see how frentagonistic you are with someone. You do <i>not</i> need to create an account. We will give you a sharable link.</div>
		<h4 data-warning ${id('warning')}>All fields are required.</h4>
		<form data-profile-form ${id('form')}>
			${Object.entries(dimensions).map(([dimension, options]) => html`<ft:editdimension data-dimension='${dimension}'>
				<div data-id='label'>${dimension}</div>
				<div data-id='options'>
					${options === 'string'
						? html`<input name='${dimension}' value='${values[dimension as keyof Profile] || ''}' aria-label='${dimension}' />`
						: options.map(option => {
							const inputId = `${dimension}-${option}`.replace(/[^a-z0-9]+/gi, '-');
							return html`<ft:radio><input id='${inputId}' type='radio' name='${dimension}' value='${option}' ${values[dimension as keyof Profile] === option ? 'checked' : ''} /><label for='${inputId}'>${option}</label></ft:radio>`;
						})}
				</div>
			</ft:editdimension>`)}
			<button type='submit'>Save</button>
		</form>
	</ft:editprofile>`;

	self.data.form.addEventListener('submit', (event: SubmitEvent) => {
		event.preventDefault();
		const data = new FormData(self.data.form);
		const profile = {} as Profile;
		let hasErrors = false;
		for (const dimension of Object.keys(dimensions) as (keyof Profile)[]) {
			profile[dimension] = String(data.get(dimension) || '').trim();
			const field = self.querySelector(`[data-dimension="${dimension}"]`) as HTMLElement;
			field.style.color = profile[dimension] ? '' : 'red';
			hasErrors = hasErrors || !profile[dimension];
		}
		self.data.warning.style.color = hasErrors ? 'red' : '';
		if (!hasErrors) saveProfile(profile);
	});

	return self;
}

export function FrentagonistApp() {
	const root = html`<ft:app data-frentagonist-app></ft:app>`;

	function render(node: HTMLElement) {
		root.replaceChildren(node);
	}

	function showEditor(values: Partial<Profile> = {}) {
		render(Editor(values, profile => {
			saveLocalProfile(profile);
			showProfile(profile);
		}));
	}

	function showProfile(profile: Profile) {
		render(ProfileView(profile, () => showEditor(profile)));
	}

	const saved = loadLocalProfile();
	if (saved) showProfile(saved);
	else showEditor();

	return root;
}
