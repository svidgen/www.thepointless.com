const { DomClass } = require('wirejs-dom');
const ABTest = require('../lib/abtest.cjs');
const MailingListSubscribe = require('./mailing-list-subscribe');

const { trackEvent } = require('../lib/tracking.cjs');

const GH_BASE_URL = 'https://github.com/svidgen/www.thepointless.com';

const variations = new ABTest(
	'subscription',
	DomClass(`<tpdc:subscribegithub>
		<header>🔥 Before you leave! 🔥</header>
		<p><b>Don't forget</b> to stay on top of our <i>shenanigans</i> and possibly some <i>not shenanigans</i> as well.</p>
		<p class='follow-options'>
			Github (
				<a href='${GH_BASE_URL}/subscription' channel='github'>Subscribe</a>
				| <a href='${GH_BASE_URL}/' channel='github'>Star</a>
			) - Twitter (
				<a href='https://twitter.com/pointlessdotcom' channel='twitter'>Follow</a>
			)
		</p>
		<p>You could even <i>participate</i> or <i>contribute</i>!</p>
		<p class='follow-options'>
			Github (
				<a href='${GH_BASE_URL}/issues' channel='github'>Issues</a>
				| <a href='${GH_BASE_URL}/discussions' channel='github'>Discussions</a>
				| <a href='${GH_BASE_URL}/fork' channel='github'>Pull Requests</a>
			)
		</p>
		<footer>😱</footer>
	</tpdc:subscribegithub>`, function SubscribeGithub() {
		const tags = [...this.getElementsByTagName('a')];
		for (const tag of tags) {
			tag.onclick = () => {
				gtag('event', 'subscribe', {
					channel: tag.attributes.get('channel')
				});
			}
		}
	}), {
		"mail_chimp": MailingListSubscribe
	},
	0.5
);

const markup = `<tpdc:subscribe>
	<div data-id='variant'></div>
</tpdc:subscribe>`;

const Subscribe = DomClass(markup, function() {
	variations.getVariant().then(v => {
		this.variant = new v()
	});
});

module.exports = Subscribe;
