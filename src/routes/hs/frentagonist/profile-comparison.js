const { DomClass } = require('wirejs-dom');

const { avg, distance, product } = require('/src/lib/math');
const DimensionComparison = require('./dimension-comparison');

const markup = `<ft:profilecomparison>
	<div data-id='details'></div>
	<h2>Conclusion: <span data-id='result'>computing...</span>%</h2>
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

	// this.result = Math.floor(
	// 	100 * distance(this.details.map(row => row.delta/100))
	// );

	const values = this.details.map(row => row.delta/100);
	this.result = Math.floor(
		100 * product(values)
	);
});

module.exports = ProfileComparison;
