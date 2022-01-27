const { DomClass } = require('wirejs-dom');

const template = `<tpdc:simplescore>
	<div>
		<span data-id='label' data-property='innerHTML'></span>
		<span data-id='score' data-property='innerHTML'></span>
		<span data-id='units' data-property='innerHTML'></span><span data-id='unit' data-property='innerHTML'></span>.
	</div>
</tpdc:simplescore>`;

const SimpleResult = DomClass(template, function _SimpleResult() {
	const url = new URL(location).searchParams;
	this.label = this.label || url.get('label');
	this.score = this.score || url.get('score');
	this.units = this.units || url.get('units');
	this.unit = this.unit || url.get('unit');

	if (Number.parseInt(this.score) === 1) {
		this.__dom.units.style.display = 'none';
	} else {
		this.__dom.unit.style.display = 'none';
	}
});

module.exports = SimpleResult;