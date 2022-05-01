const { DomClass } = require('wirejs-dom');

const markup = `<ft:editprofile>
	<div data-id='pickers'></div>
</ft:editprofile>`;

const Editor = DomClass(markup, function _Editor() {
	this.pickers = Object.entries(this.dimensions).map(([label, values]) => {
		const n = document.createElement('div');
		n.innerHTML = `<h3>${label}</h3>
			<div>${values.join()}</div>
		`;
		return n;
	});
});

module.exports = Editor;
