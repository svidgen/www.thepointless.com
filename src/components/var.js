const { DomClass } = require('wirejs-dom');

//
// Used for rendering HTTP GET params into markup.
// Values can later by accessed by `.value` property if needed.
//
// E.g., For https://thepointless.com/page?code=abc123
//
// <tpdc:var get="code"></tpdc:var>
//
// ... will render `abc123` on the page.
//
// You can also provide `unit` and `units` attributes, for singular/plural
// units to be printed after a number.
//

const template = `<tpdc:var><span
	data-id='value'
	data-property='innerHTML'></span>
	<span
		data-id='units'
		data-property='innerHTML'
		style='display: none'
	></span><span
		data-id='unit'
		data-property='innerHTML'
		style='display: none'
	></span></tpdc:var>`;

const GetVariable = DomClass(template, function _GetVariable() {
	const url = new URL(location).searchParams;

	this.get = this.get || 'value';
	this.value = this.value || url.get(this.get);

	const intval = Number.parseInt(this.value);
	if (intval === 1 || intval === -1) {
		this.__dom.unit.style.display = 'inline';
	} else {
		this.__dom.units.style.display = 'inline';
		
	}
});

module.exports = GetVariable;