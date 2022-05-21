const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('s');
const local = new (require('/src/lib/state'))(__filename);
const { pack, unpack } = require('/src/lib/enumcode');

const dimensions = require('./dimensions');
const ProfileEditor = require('./profile-editor');
const ProfileView = require('./profile-view');
const ProfileComparison = require('./profile-comparison');

require('./index.css');

const PROFILE_VERSION = 1;

const markup = `<ft:app>
	<div data-id='action'></div>
	<div data-id='editControl'>
		<input type='button' data-id='editButton' value='Edit Profile' />
	</div>
</ft:app>`;

// TODO: include widget to import/export profile

function shareUrl(profile) {
	const url = new URL(location.href);
	url.searchParams.set('s', btoa(JSON.stringify({
		p: local.profile,
		v: PROFILE_VERSION
	})));
	return url.href;
}

function shareString(dimensions, profile) {
	return Object.keys(dimensions).map(dimension => {
		const values = dimensions[dimension];
		if (values instanceof Array) {
			let found = false;
			return values.map(v => {
				if (v === profile[dimension]) {
					found = true;
					return '✅';
				} else {
					return found ? '🟦' : '🟥';
				}
			}).join('');
		} else if (dimension.toLowerCase() !== 'name') {
			return profile[dimension];
		}
	}).join('\n');
}

const App = DomClass(markup, function _App() {

	this.render = (edit = null) => {
		if (!(local.profile && local.version == PROFILE_VERSION) || edit) {
			// user needs to create a profile!
			this.action = [];

			if (local.version != PROFILE_VERSION) {
				this.action.push(`
					<b style='color: darkred;'>Yes, I know you created
					a profile already</b>, but it's from an older version of the
					questionnaire. The new one is better. <i>I promise!</i>
				`);
			}
			
			this.action.push(new ProfileEditor({
				dimensions,
				values: edit || {},
				onsave: profile => {
					console.debug(dimensions, profile)
					console.debug(
						shareString(dimensions, profile),
						shareUrl(profile)
					);
					local.profile = pack(dimensions, profile);
					local.version = PROFILE_VERSION;
					this.render();
				}
			}));

			this.editControl.style.display = 'none';
		} else {
			const saved = unpack(dimensions, local.profile);
			
			this.editControl.style.display = '';
			this.editButton.onclick = () => this.render(saved);

			if (ephemeral.p && ephemeral.v == PROFILE_VERSION) {
				console.debug('profile', ephemeral.p);
				const linked = unpack(dimensions, ephemeral.p);
				this.action = new ProfileComparison({
					dimensions,
					theirs: linked,
					yours: saved,
					link: shareUrl(saved)
				});
			} else {
				this.action = [];

				if (ephemeral.p && ephemeral.v != PROFILE_VERSION) {
					this.action.push(`
						<b style='color: darkred;'>Sorry, but the profile link
						you were given is from an older version of of the
						questionnaire.</b> Please ask the person who shared it
						with you to fill out a new one. As you know, <i>it's
						a very quick process!</i>
					`);
				}
				
				this.action.push(new ProfileView({
					dimensions,
					profile: saved,
					link: shareUrl(saved),
					shareString: shareString(dimensions, saved)
				}));
			}
		}
	}

	this.render();
});
