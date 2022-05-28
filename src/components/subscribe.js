const { DomClass } = require('wirejs-dom');

const { trackEvent } = require('../lib/tracking');

const GH_BASE_URL = 'https://github.com/svidgen/www.thepointless.com';

const markup = `<tpdc:subscribe>
	<header>🔥 Before you leave! 🔥</header>
	<p><b>Don't forget</b> to stay on top of our <i>shenanigans</i> and possibly some <i>not shenanigans</i> as well.</p>
	<p class='follow-options'>
		Github (
			<a href='${GH_BASE_URL}/subscription'>Subscribe</a>
			| <a href='${GH_BASE_URL}/'>Star</a>
		) - Twitter (
			<a href='https://twitter.com/pointlessdotcom'>Follow</a>
		)
	</p>
	<p>You could even <i>participate</i> or <i>contribute</i>!</p>
	<p class='follow-options'>
		Github (
			<a href='${GH_BASE_URL}/issues'>Issues</a>
			| <a href='${GH_BASE_URL}/discussions'>Discussions</a>
			| <a href='${GH_BASE_URL}/fork'>Pull Requests</a>
		)
	</p>
	<footer>😱</footer>
</tpdc:subscribe>`;

const Subscribe = DomClass(markup);

module.exports = Subscribe;
