const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('p');
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
			const profile = unpack(dimensions, local.profile);
	
			if (ephemeral.p) {
			} else {
				const profileView = new ProfileView({
					dimensions,
					profile
				});
				profileView.oneditclick = () => this.render(profile);
				this.action = profileView;
			}
		}
	}

	this.render();
});
