const { DomClass } = require('wirejs-dom');

const DimensionView = require('./dimension-view');

const markup = `<ft:profileview>
	<div data-id='dimensionsView'></div>
	<div data-id='actions'>
		<input type='button' data-id='editButton' value='Edit' />
		<a data-id='link' data-property='href' target='_blank'>permalink</a></div>
	</div>
</ft:profileview>`;

const ProfileView = DomClass(markup, function _Editor() {
	this.dimensionsView = Object.keys(this.dimensions).map(label => {
		return new DimensionView({label, value: this.profile[label]});
	});

	if (this.readonly) {
		this.actions.style.display = 'none';
	} else {
		this.editButton.onclick = () => {
			this.oneditclick();
		};
	}
});

module.exports = ProfileView;
