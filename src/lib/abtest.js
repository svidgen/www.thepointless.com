const trackEvent = require('./tracking');
const State = require('./state');

class ABTest {
	/**
	 * Basic A/B test with Google Analytics tracking using events.
	 * 
	 * Assumes that each user is "enrolled" in an option and that option
	 * is intended to be "sticky" for the user for all subsequent visits.
	 * 
	 * @param {string} name A unique name.
	 * @param {any} control The default/baseline/control option.
	 * @param {object} options A key-value set of options to select from.
	 * @param {number} allocation Percent of traffic, represented as a
	 * decimal (0.15 = 15%) that defines how how much site traffic to put
	 * under test to serve one of the `options` to. The remainder of visitors
	 * will all be given the `control` (or baseline) option.
	 */
	constructor(name, control, options, allocation = 0.1) {
		this.name = name;
		this.control = control;
		this.options = options;
		this.allocation = allocation;
	}

	track(option) {
		gtag('event', 'ab_test', {
			'name': this.name,
			'segment': option || 'control'
		});
	}

	getVariantKey() {
		const key = 'tpdc.abtest.' + this.name;

		let variant = localStorage.getItem(key);
		if (variant === null) {
			variant = this.selectVariant();
			localStorage.setItem(key, variant);
		}

		return variant;
	}

	selectVariant() {
		if (Math.random() < this.allocation) {
			const options = Object.keys(this.options);
			const index = Math.floor(Math.random() * options.length);
			return options[index];
		} else {
			// default option
			return '';
		}
	}

	async getVariant() {
		const key = this.getVariantKey();
		this.track(key);
		console.log({
			key,
			control: this.control,
			options: this.options
		});
		return key === '' ? this.control : this.options[key];
	}
}

module.exports = ABTest;
