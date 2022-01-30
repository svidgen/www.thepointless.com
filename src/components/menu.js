const { DomClass } = require('wirejs-dom');
require('./menu.css');

module.exports = DomClass(`<tpdc:menu>
	<a href="/">home</a>
	<a href="/apps">apps &amp; games</a>
	<a href="/books">books</a>
	<a href="https://twitter.com/pointlessdotcom">twitter</a>
</tpdc:menu>`);

