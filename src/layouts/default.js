const wirejs = require('wirejs-dom');
require('highlight.js/styles/github.css');

require('./default.css');
require('../components/share');
require('../components/copyright');
require('../components/page-build-time');
require('../components/var');
require('../components/result-card');

const GoogleAds = require('ex-gratia/google');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.\d+|192\.168\.\d+\.\d+$/)) {
	new GoogleAds().install();
}

// expose DomClass to later scripts.
Object.assign(window, wirejs);

// because this script is intended to be loaded at the top, and DomClass
// doesn't currently handle this, we need to bless() the document async (after the DOM is built).
// we may even want to do this repeatedly over the course of a few seconds to
// allow for "settling". (it should be safe to call "bless" repeatedly.)

function init() {
	document.readyState === 'complete' ?
		wirejs.bless(document) :
		setTimeout(init, 1);
}

setTimeout(init, 1);
