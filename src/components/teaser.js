const { DomClass } = require('wirejs-dom');
const sitemap = require('../sitemap');
const State = require('../lib/state');

const template = `<tpdc:teaser>
	<div>
		<b><span data-id='teaser'></span></b>
		<a data-id='link' data-property='href'><span data-id='title'></span></a>
	</div>
</tpdc:teaser>`;

const Teaser = DomClass(template, function _Teaser() {

	const state = new State(__filename);

	function getTeaser() {
		const teasers = [
			"Hey look!",
			"My my my ...",
			"Look what the bat dragged in.",
			"Well if it isn't",
			"Whoa! Look!!!"
		];
		const index = Math.floor(Math.random() * teasers.length);
		return teasers[index];
	}

	/**
	 * @param {*} lastId The index of the last feature teased.
	 * Increases forever and is modded against feature list.
	 * @param {*} count The number of times the current feature
	 * has been teased, so we can limit how many times to tease
	 * the same feature.
	 * @returns {[string, string, number, number]} `[link, title, index, newCount]`
	 */
	function getFeature(lastId, count) {
		const features = Object.entries(sitemap.features);
		const currentPage = document.location.pathname;

		let index = lastId || 0;
		let newCount = typeof count === 'undefined' ? 0 : count + 1;
		let featureToTease = features[index % features.length];

		if (currentPage == featureToTease[0] || count >= 3) {
			index += 1;
			featureToTease = features[index % features.length];
			newCount = 0;
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
