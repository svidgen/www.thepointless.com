const { DomClass } = require('wirejs-dom');

const template = `<tpdc:fork>
	<div class='banner'>
		<a
			href='https://github.com/svidgen/www.thepointless.com'
			target='_blank'
		>Make</a>
	</div>
</tpdc:fork>`;

module.exports = DomClass(template)
