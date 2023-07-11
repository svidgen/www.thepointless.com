const { DomClass } = require('wirejs-dom');
require('./menu.css');

module.exports = DomClass(`<tpdc:menu>
	<a href="/">home</a>
	<a href="/apps-etc.html">apps &amp; games</a>
	<a href="/books.html">books</a>
	<a href="/words/index.html">words</a>
	<a href="/feed.rss" target='_blank'>
		<img
			src='https://wp-assets.rss.com/blog/wp-content/uploads/2019/10/10111557/social_style_3_rss-512-1.png'
			style='height: 0.8em;'
		/> RSS
	</a>
</tpdc:menu>`);

