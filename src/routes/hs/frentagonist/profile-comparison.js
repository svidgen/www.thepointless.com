const { DomClass } = require('wirejs-dom');

const DimensionComparison = require('./dimension-comparison');

const markup = `<ft:profilecomparison>
	<div data-id='details'></div>
	<h2>Conclusion: <span data-id='result'>computing...</span></h2>
</ft:profilecomparison>`;

const ProfileComparison = DomClass(markup, function() {
	this.details = Object.keys(this.dimensions).map(dimension => {
		return new DimensionComparison({
			dimension,
			theirProfile: this.theirs,
			yourProfile: this.yours,
			dimensions: this.dimensions,
		});
	});
});

module.exports = ProfileComparison;
