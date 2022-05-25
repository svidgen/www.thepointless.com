const { DomClass } = require('wirejs-dom');

const { avg, distance, product } = require('/src/lib/math');

const Share = require('/src/components/share');
const Percentage = require('./percentage');
const DimensionComparison = require('./dimension-comparison');

const markup = `<ft:profilecomparison>
	<div data-id='details'></div>
	<p style='font-weight: bold; color: darkgreen;'>Based on our <i>highly scientific</i> calculations ...</p>
	<h2>You are <ft:percentage data-id='result'></ft:percentage> likely to be friends.</h2>
	<div data-id='interpretation'></div>
	<tpdc:share data-id='resultShare' header='Share your result'></tpdc:share>
	<tpdc:subscribe></tpdc:subscribe>
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

	const values = this.details.map(row => row.match/100);
	this.result.value = Math.floor(
		100 * product(values)
	);

	// this.interpretation = ...

	// make better!!!
	this.resultShare.getData = () => ({
		title: "Frentagonist Results!",
		text: `It looks like you and I are ${Math.floor(
			100 * product(values)
		)}% likely to be friends. 🤷\n\nCompare against my frentagonist profile here:`,
		url: this.link
	});

});

module.exports = ProfileComparison;
