const { DomClass } = require('wirejs-dom');

const ProfileDimensionView = require('./profile-dimension-view');

const markup = `<ft:profileview>
	<div>
		<input type='button' data-id='editButton' value='Edit' />
	</div>
	<div data-id='dimensions'></div>
</ft:profileview>`;

const ProfileView = DomClass(markup, function _Editor() {
	this.dimensions = Object.entries(this.profile).map(([label, value]) => {
		return new ProfileDimensionView({label, value});
	});

	this.editButton.onclick = () => {
		this.oneditclick();
	};
});

module.exports = ProfileView;
