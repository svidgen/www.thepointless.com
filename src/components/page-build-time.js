const { DomClass } = require('wirejs-dom');

const template = `<tpdc:pagebuildtime>
	<span data-id='time'>record time</span>
</tpdc:pagebuildtime>`;

const PageBuildTime = DomClass(template, function _PageBuildTime() {
	const _t = this;
	if (window.performance) {
		const loop = setInterval(() => {
			const perfData = window.performance.timing;
			console.log('perfdata', perfData);
			const time = perfData.loadEventEnd - perfData.navigationStart;
			if (time > 0) {
				_t.time = `${time} ms`;
				clearInterval(loop);
			}
		}, 100);
	}
});
