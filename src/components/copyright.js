const { DomClass } = require('wirejs-dom');

const template = `<tpdc:copyright>
	<a href='/y2k'>&copy;<span data-id='year'>10k AD</span></a>
</tpdc:copyright>`;

const Copyright = DomClass(template, function _Copyright() {
	this.year = new Date().getFullYear() - 100;
});
