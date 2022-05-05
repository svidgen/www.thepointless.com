const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('p');
const local = new (require('/src/lib/state'))(__filename);
const { encode, decode } = require('/src/lib/enumcode');

const dimensions = require('./dimensions');
const ProfileEditor = require('./profile-editor');

const markup = `<ft:app>
	<div data-id='action'></div>
</ft:app>`;

// TODO: include widget to import/export profile

const App = DomClass(markup, function _App() {
	if (!local.profile) {
		// user needs to create a profile!
		this.action = new ProfileEditor({
			dimensions,
			onsave: profile => {
				console.log(profile)
				local.profile = encode(dimensions, profile);
			}
		});
	} else {
		const profile = decode(dimensions, local.profile);
		console.debug('loaded profile', profile);
		
		if (ephemeral.p) {
		} else {
		}
	}
});
