function trackEvent(action, o_label, o_value, o_noninteraction) {
	if (typeof globalThis.gtag !== 'function') {
		return;
	}

	globalThis.gtag('event', action, {
		'event_category': 'game',
		'event_label': o_label,
		'value': o_value,
		'non_interaction': o_noninteraction
	});
};

module.exports = {
	trackEvent
};
