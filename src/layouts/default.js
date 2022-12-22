const wirejs = require('wirejs-dom');
require('highlight.js/styles/github.css');

// sheet(s) first
require('./default.css');

// components in alphabetical order, please!
require('../components/copyright');
require('../components/fork');
require('../components/menu');
require('../components/page-build-time');
require('../components/result-card');
require('../components/share');
require('../components/subscribe');
require('../components/teaser');
require('../components/var');
require('../components/feature-link');

// utils
const { on, onready, once } = require('../lib/event');
window.on = on;
window.onready = onready;
window.once = once;

const GoogleAds = require('ex-gratia/google');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.\d+|192\.168\.\d+\.\d+$/)) {
	// delayed in an attempt to prevent ads from block rendering of
	// other components.
	setTimeout(() => {
		new GoogleAds().install();
	}, 250);
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
