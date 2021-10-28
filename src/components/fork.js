const { DomClass } = require('wirejs-dom');

const template = `<tpdc:fork>
	<div class='banner'>
		<a href='https://github.com/svidgen/www.thepointless.com'>$ Profit $</a>
	</div>
</tpdc:fork>`;

module.exports = DomClass(template)
