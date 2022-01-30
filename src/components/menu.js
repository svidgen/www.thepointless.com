const { DomClass } = require('wirejs-dom');
require('./menu.css');

module.exports = DomClass(`<tpdc:menu>
	<a href="/">home</a>
	<a href="apps">apps</a>
	<a href="games">games</a>
	<a href="books">books</a>
	<a href="essays">essays</a>
	<a href="quotes">quotes</a>
	<a href="https://twitter.com/pointlessdotcom">twitter</a>
</tpdc:menu>`);

