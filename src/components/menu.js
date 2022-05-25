const { DomClass } = require('wirejs-dom');
require('./menu.css');

module.exports = DomClass(`<tpdc:menu>
	<a href="/">home</a>
	<a href="/apps-etc.html">apps &amp; games</a>
	<a href="/books.html">books</a>
	<a href="/words/index.html">words</a>
</tpdc:menu>`);

