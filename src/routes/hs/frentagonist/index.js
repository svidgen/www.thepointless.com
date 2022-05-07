const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('s');
const local = new (require('/src/lib/state'))(__filename);
const { pack, unpack } = require('/src/lib/enumcode');

const dimensions = require('./dimensions');
const ProfileEditor = require('./profile-editor');
const ProfileView = require('./profile-view');

const markup = `<ft:app>
	<div data-id='action'></div>
</ft:app>`;

// TODO: include widget to import/export profile

const App = DomClass(markup, function _App() {

	this.render = (edit = null) => {
		if (!local.profile || edit) {
			// user needs to create a profile!
			this.action = new ProfileEditor({
				dimensions,
				values: edit || {},
				onsave: profile => {
					console.log(profile)
					local.profile = pack(dimensions, profile);
					this.render();
				}
			});
		} else {
			this.action = [];

			if (ephemeral.p) {
				console.log('profile', ephemeral.p);
				const linked = unpack(dimensions, ephemeral.p);
				const linkedView = new ProfileView({
					dimensions,
					profile: linked,
					readonly: true
				});
				this.action.push('<h3>Linked Profile</h3>');
				this.action.push(linkedView);
			}

			const saved = unpack(dimensions, local.profile);
			const profileView = new ProfileView({
				dimensions,
				profile: saved,
				link: '?s=' + btoa(JSON.stringify({p: local.profile}))
			});
			profileView.oneditclick = () => this.render(saved);

			this.action.push('<h3>Saved Profile</h3>');
			this.action.push(profileView);
		}
	}

	this.render();
});
