const { DomClass } = require('wirejs-dom');

const DimensionEditor = require('./dimension-editor');

const markup = `<ft:editprofile>
	<h3 data-id='instructions'>
		All fields are required.
	</h3>

	<div data-id='pickers'></div>
	<p>
		<input type='button' data-id='saveButton' value='Save' />
	</p>
</ft:editprofile>`;

const ProfileEditor = DomClass(markup, function _Editor() {
	const index = {};

	this.pickers = Object.entries(this.dimensions).map(
		([label, values]) => {
			const preset = this.values[label];
			index[label] = new DimensionEditor({ label, values, preset });
			return index[label];
		}
	);

	this.saveButton.onclick = () => {
		const profile = Object.fromEntries(
			this.pickers.map(p => ([p.label, p.value]))
		);
		
		let hasErrors = false;
		this.instructions.style.color = '';

		for (const label of Object.keys(this.dimensions)) {
			if (profile[label] === '') {
				index[label].style.color = 'red';
				this.instructions.style.color = 'red';
				hasErrors = true;
			} else {
				index[label].style.color = '';
			}
		}

		if (!hasErrors) {
			this.onsave(profile);
		}
	}
});

module.exports = ProfileEditor;
