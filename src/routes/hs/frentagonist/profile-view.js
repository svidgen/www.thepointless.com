const { DomClass } = require('wirejs-dom');

const Share = require('/src/components/share');
const DimensionView = require('./dimension-view');

const markup = `<ft:profileview>
	<div data-id='dimensionsView'></div>
	<div data-id='actions'>
		<tpdc:share
			data-id='share'
			methods='twitter,email,copy,qr,native'
		><div data-id='header' style='color: darkgreen; font-weight: bold;'>
				Share to separate the friends from the foes.
			</div>
		</tpdc:share>
	</div>
</ft:profileview>`;

const ProfileView = DomClass(markup, function _Editor() {
	this.dimensionsView = Object.keys(this.dimensions).map(label => {
		return new DimensionView({label, value: this.profile[label]});
	});

	this.share.getData = () => ({
		title: `Frentagonist test`,
		text: [
			`My Frentagonist Profile`,
			this.shareString,
			'',
			`See if we should 🍻 or ⚔️:`
		].join('\n'),
		url: this.link
	});

	if (this.readonly) {
		this.actions.style.display = 'none';
	}
});

module.exports = ProfileView;
