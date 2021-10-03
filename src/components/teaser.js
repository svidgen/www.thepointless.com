const { DomClass } = require('wirejs-dom');
const sitemap = require('../sitemap');
const State = require('../lib/state');

const template = `<tpdc:teaser>
	<div>
		<span data-id='teaser'></span>:
		<a data-id='link' data-property='href'><span data-id='title'></span></a>
	</div>
</tpdc:teaser>`;

const Teaser = DomClass(template, function _Teaser() {

	function getTeaser() {
		const teasers = [
			"If you thought <i>that</i> was neat, <b>you're weird!</b> May as well check this out too",
			"I can't tell if this reminds me more of a llama or a duck"
		];
		const index = Math.floor(Math.random() * teasers.length);
		return teasers[index];
	}

	function getFeature(lastId) {
		const features = Object.entries(sitemap.features);
		const currentPage = document.location.pathname;

		let index = lastId || 0;
		let featureToTease = features[index];

		if (currentPage == featureToTease) {
			index++;
			featureToTease = features[index];
		}

		const [link, title] = featureToTease;

		return [link, title, index];
	}

	const state = new State('teaser');

	this.teaser = getTeaser();
	[this.link, this.title, state.lastId] = getFeature(state.lastId);

});
