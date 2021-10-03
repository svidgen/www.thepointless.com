const { DomClass } = require('wirejs-dom');
const sitemap = require('../sitemap');
const State = require('../lib/state');

const template = `<tpdc:teaser>
	<div>
		<span data-id='teaser'></span>:<br />
		<a data-id='link' data-property='href'><span data-id='title'></span></a>
	</div>
</tpdc:teaser>`;

const Teaser = DomClass(template, function _Teaser() {

	const state = new State(__filename);

	function getTeaser() {
		const teasers = [
			"If you thought <i>that</i> was ADJECTIVE, you'll <u>really</u> VERB <b>this</b>",
			"I can't tell if this reminds me more of a llama or a duck",
			"It may look like a booger, but itsnot",
			"If it smells like a fart, it is a fart",
			"Not to put too fine a point on it, say you're the only bae in my bayonet",
			"Oh, come hither",

		];
		const index = Math.floor(Math.random() * teasers.length);
		return teasers[index];
	}

	function getFeature(lastId, count) {
		const features = Object.entries(sitemap.features);
		const currentPage = document.location.pathname;

		let index = lastId || 0;
		let newCount = count ? count + 1 : 0;
		let featureToTease = features[index];

		if (currentPage == featureToTease[0] || count > 3) {
			index = (index + 1) % features.length;
			featureToTease = features[index];
			newCount = 1;
		}

		const [link, title] = featureToTease;
		return [link, title, index, newCount];
	}

	this.teaser = getTeaser();
	[this.link, this.title, state.lastId, state.count] = getFeature(
		state.lastId,
		state.count
	);

});

module.exports = Teaser;