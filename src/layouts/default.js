require('./default.css');
const GoogleAds = require('ex-gratia/google');

require('../components/share.js');
require('../components/simple-score.js');
require('../components/var.js');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.1$/)) {
	new GoogleAds().install();
}
