const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('s');
const local = new (require('/src/lib/state'))(__filename);
const { pack, unpack } = require('/src/lib/enumcode');

const dimensions = require('./dimensions');
const ProfileEditor = require('./profile-editor');
const ProfileView = require('./profile-view');
const ProfileComparison = require('./profile-comparison');

require('./index.css');

const markup = `<ft:app>
	<div data-id='action'></div>
	<div data-id='editControl'>
		<input type='button' data-id='editButton' value='Edit Profile' />
	</div>
</ft:app>`;

// TODO: include widget to import/export profile

function shareUrl(profile) {
	const url = new URL(location.href);
	url.searchParams.set('s', btoa(JSON.stringify({p: local.profile})));
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
		if (!local.profile || edit) {
			// user needs to create a profile!
			this.action = new ProfileEditor({
				dimensions,
				values: edit || {},
				onsave: profile => {
					console.debug(dimensions, profile)
					console.debug(
						shareString(dimensions, profile),
						shareUrl(profile)
					);
					local.profile = pack(dimensions, profile);
					this.render();
				}
			});
			this.editControl.style.display = 'none';
		} else {
			const saved = unpack(dimensions, local.profile);
			
			this.editControl.style.display = '';
			this.editButton.onclick = () => this.render(saved);

			if (ephemeral.p) {
				console.log('profile', ephemeral.p);
				const linked = unpack(dimensions, ephemeral.p);
				this.action = new ProfileComparison({
					dimensions,
					theirs: linked,
					yours: saved,
				});
			} else {
				this.action = new ProfileView({
					dimensions,
					profile: saved,
					link: shareUrl(saved),
					shareString: shareString(dimensions, saved)
				});
			}
		}
	}

	this.render();
});
