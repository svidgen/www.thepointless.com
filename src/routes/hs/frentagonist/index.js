const { DomClass } = require('wirejs-dom');

const ephemeral = new (require('/src/lib/url-state'))('p');
const local = new (require('/src/lib/state'))(__filename);

const dimensions = require('./dimensions');
const ProfileEditor = require('./profile-editor');

const markup = `<ft:app>
	<div data-id='action'></div>
</ft:app>`;

// TODO: include widget to import/export profile

const App = DomClass(markup, function _App() {
	if (!local.profile) {
		// user needs to create a profile!
		this.action = new ProfileEditor({dimensions});
	} else {
		if (ephemeral.p) {
		} else {
		}
	}
});
