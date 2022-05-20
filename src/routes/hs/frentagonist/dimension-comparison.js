const { DomClass } = require('wirejs-dom');

const Percentage = require('./percentage');

const markup = `<ft:dimensioncomparison>
	<table style='width: 100%'>
		<tr>
			<th colspan='3'>
				<span data-id='dimension'></span>
			</th>
		</tr>
		<tr>
			<td style='width: 33%;'><span data-id='theirs'></span></td>
			<td style='width: 33%;'><span data-id='yours'></span></td>
			<td style='width: 33%;'><b><ft:percentage data-id='matchView'></ft:percentage></b></td>
		</tr>
	</table>
</ft:dimensioncomparision>`;


const DimensionComparison = DomClass(markup, function() {
	this.theirs = this.theirProfile[this.dimension];
	this.yours = this.yourProfile[this.dimension];

	const computeScore = value => {
		const options = this.dimensions[this.dimension];

		// highly scientific stuff here, folks.
		if (options instanceof Array) {
			const index = options.indexOf(value);
			return Math.floor(100 * (index / (options.length - 1)));
		} else {
			return value.length;
		}
	};

	const theirScore = computeScore(this.theirs);
	const yourScore = computeScore(this.yours);
	this.match = 100 - Math.abs(theirScore - yourScore);
	this.matchView.value = this.match;
});

module.exports = DimensionComparison;
