require('./default.css');
require('highlight.js/styles/github.css');
const GoogleAds = require('ex-gratia/google');

require('../components/share.js');
require('../components/copyright.js');
require('../components/var.js');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.\d+|192\.168\.\d+\.\d+$/)) {
	new GoogleAds().install();
}
