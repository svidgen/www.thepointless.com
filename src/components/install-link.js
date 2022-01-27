const { DomClass } = require('wirejs-dom');
const { trackEvent } = require('../lib/tracking');
require('./install-link.css');

const template = `<ss:installlink>
	<hr />
	<div data-id='button' class='button'>
	<img data-id='icon_img' />
	Install
	</div>
</ss:installlink>`;

const InstallLink = DomClass(template, function _InstallLink() {
	var _t = this;
	this.icon_img.src = this.icon;

	this.show = function() {
		_t.classList.add('show');
	};

	this.button.onclick = function(e) {
		InstallLink.evt.prompt();
		InstallLink.evt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				_t.classList.remove('show');
				trackEvent('install');
			} else {
				trackEvent('cancelled-install');
			}
			InstallLink.evt = null;
		});
	};

	if (InstallLink.evt) {
		_t.show();
	}

	InstallLink.links = InstallLink.links || [];
	InstallLink.links.push(this);
});

window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault();
	InstallLink.evt = e;
	InstallLink.links.forEach(l => l.show());
});

module.exports = {
	InstallLink
};
