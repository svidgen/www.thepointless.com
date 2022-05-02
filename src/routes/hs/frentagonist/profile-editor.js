const { DomClass } = require('wirejs-dom');

const DimensionEditor = require('./dimension-editor');

const markup = `<ft:editprofile>
	<div data-id='pickers'></div>
</ft:editprofile>`;

const Editor = DomClass(markup, function _Editor() {
	this.pickers = Object.entries(this.dimensions).map(
		([label, values]) => new DimensionEditor({ label, values })
	);
});

module.exports = Editor;
