const { DomClass } = require('wirejs-dom');

const Radio = require('./radio');

// TODO: fix impurity. includes css and superfluous container div
const markup = `<ft:editdimension>
	<div style='margin: 1em;'>
		<div><b data-id='label'></b></div>
		<div data-id='options'></div>
	</div>
</fd:editdimension>`;

const DimensionEditor = DomClass(markup, function _DimensionEditor() {
	this.value = null;
	this.options = this.values.map(value => new Radio({
		name: this.label,
		value,
		onselect: value => {
			this.value = value;
			console.debug(`${this.label} => ${this.value}`);
		}
	}));
});

module.exports = DimensionEditor;
