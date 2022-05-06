const { DomClass } = require('wirejs-dom');

const DimensionView = require('./dimension-view');

const markup = `<ft:profileview>
	<div>
		<input type='button' data-id='editButton' value='Edit' />
	</div>
	<div data-id='dimensionsView'></div>
</ft:profileview>`;

const ProfileView = DomClass(markup, function _Editor() {
	this.dimensionsView = Object.keys(this.dimensions).map(label => {
		return new DimensionView({label, value: this.profile[label]});
	});

	this.editButton.onclick = () => {
		this.oneditclick();
	};
});

module.exports = ProfileView;
