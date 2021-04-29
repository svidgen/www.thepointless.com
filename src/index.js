const GoogleAds = require('ex-gratia/google');

// no ads at "home".
if (!location.hostname.match(/^localhost|127\.0\.0\.1$/)) {
	new GoogleAds().install();
}
