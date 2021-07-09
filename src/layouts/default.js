require('highlight.js/styles/github.css');
const GoogleAds = require('ex-gratia/google');

require('./default.css');
require('../components/share');
require('../components/copyright');
require('../components/page-build-time');
require('../components/var');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.\d+|192\.168\.\d+\.\d+$/)) {
	new GoogleAds().install();
}
