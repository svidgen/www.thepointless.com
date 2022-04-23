const { DomClass } = require('wirejs-dom');
const KeyCode = require('../lib/keycode');

require('./modal.css');

const template = `<tpdc:modal>
	<div data-id='backdrop'></div>
	<div class='content'>
		<div data-id='content'></div>
	</div>
</tpdc:modal>`;

const Modal = DomClass(template, function _Modal() {
	var _t = this;
	
	var backdrop;

	var handleKeyUp = function(e) {
		var e = new KeyCode(e || window.event);
		if (e.code == 'Escape') {
			_t.close();
		}
	};

	this.open = function(data) {
		// backdrop = document.createElement('div');
		// backdrop.className = 'backdrop';
		this.backdrop.onclick = function(evt) {
			(evt || window.event).stopPropagation();
			_t.close();
			return false;
		};

		document.body.appendChild(this);
		document.body.onkeyup = handleKeyUp;
		_t.active = true;
		refresh();
		// on(_t, 'open').fire(data);
	};

	this.close = function(data) {
		if (!_t.active) return;

		document.body.onkeyup = null;
		
		this.parentNode.removeChild(this);
		_t.active = false;
		refresh();
		// on(_t, 'close').fire(data);
	};

	var refresh = function() {
		// if (_t.active) {
		// 	TG.addClassname(_t, 'active');
		// } else {
		// 	TG.removeClassname(_t, 'active')
		// }
	};
});

module.exports = Modal;