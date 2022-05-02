const { DomClass } = require('wirejs-dom');

const markup = `<ft:editdimension>
	<div><b data-id='label'></b></div>
	<div data-id='options'></div>
</fd:editdimension>`;

function radio(parent, value) {
	const radio = document.createElement('input');
	radio.type = 'radio';
	radio.name = parent.label;
	radio.value = value;
	radio.onclick = () => {
		if (radio.checked) {
			parent.selected = value;
			console.log('selected', parent.label, value);
		}
	};
	return radio;
}

const DimensionEditor = DomClass(markup, function _DimensionEditor() {
	this.selected = null;
	this.options = this.values.map(o => radio(this, o));
});

module.exports = DimensionEditor;
