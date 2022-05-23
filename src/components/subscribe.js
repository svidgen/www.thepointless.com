const { DomClass } = require('wirejs-dom');

const markup = `<tpdc:subscribe>
	<header>🔥 Before you leave! 🔥</header>
	<p>Don't forget to 
		<a href='https://github.com/svidgen/www.thepointless.com/subscription'
			>Subscribe on Github</a> or
		<a href='https://twitter.com/pointlessdotcom'>Follow us on Twitter</a>!
	</p>
	<p>Yes, that's right. We're open source! You're welcome to join the discussion,
		make requests, or even <a
			href='https://github.com/svidgen/www.thepointless.com/fork'
		>fork us</a> to contribute your great ideas &mdash; and possibly even
		earn a little cash! 💰
	</p>
</tpdc:subscribe>`;

const Subscribe = DomClass(markup);

module.exports = Subscribe;