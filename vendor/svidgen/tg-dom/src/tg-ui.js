require('tg-upon.js');
require('tg-namespace.js');
require('tg-dom.js');


var _bindq = _bindq || [];

TG.UI.SubmitButton = function() {
	var _t = this;
	this.submitButton.onclick = function() {
		on(_t, 'submit').fire();
	}; // onclick()

	setType(this, 'TG.UI.SubmitButton');
	onready(this).fire();
}; // TG.UI.SubmitButton
TG.UI.SubmitButton.templateMarkup = "\
	<input type='button' data-id='submitButton' value='Sign in' />\
";
_bindq.push(TG.UI.SubmitButton, '.tg-submit-button');


TG.UI.Field = function() {
	var _t = this;

	this.style.width = '100%';

	this.setName = function(n) {
		this.fieldInput.name = n;
		this.fieldLabel.innerHTML = n;
	}; // setName()

	this.getName = function() {
		return this.fieldLabel.innerHTML;
	}; // getName()

	this.setValue = function(v) {
		this.fieldInput.value = v;
	}; // setValue()

	this.getValue = function() {
		return this.fieldInput.value;
	}; // getValue()

	this.focus = function() {
		this.fieldInput.focus();
	}; // focus();

	this.blur = function() {
		this.fieldInput.blur();
	}; // blur()

	var n = this.name || this['data-name'] || '';
	this.setName(n);

	var v = this.value || this['data-value'] || '';
	this.setValue(v);

	var t = this.type || this['data-type'] || this.fieldInput.type;
	this.fieldInput.type = t;

	this.onclick = function() { this.fieldInput.focus(); };

	setType(this, 'TG.UI.Field');
	onready(this).fire();
}; // TG.UI.Field
TG.UI.Field.templateMarkup = "\
	<label data-id='fieldLabel' style='display: inline-block; width: 33%; margin: 0px;'></label>\
	<input type='text' data-id='fieldInput' style=' display: inline-block; width: 60%;'></input>\
";
_bindq.push(TG.UI.Field, '.tg-field');


TG.UI.PasswordField = function() {
	this.type = 'password';
	TG.UI.Field.call(this);
	setType(this, 'TG.UI.PasswordField');
	onready(this).fire();
}; // TG.UI.PasswordField
TG.UI.PasswordField.templateMarkup = TG.UI.Field.templateMarkup;
_bindq.push(TG.UI.PasswordField, '.tg-password-field');


TG.UI.RadioGroup = function() {
	var _t = this;

	this.options = [];
	this.index = {};
	this.selected = null;

	this.add = function(o) {
		if (isa(o, 'TG.UI.Radio')) {
			this.container.appendChild(o);
			this.options.push(o);
			this.index[o.value] = o;
			on(o, 'selectaction', function() { _t.setValue(o.value); });
			if (o.selected) _t.setValue(o.value);
		}
	}; // add()

	this.setValue = function(v) {
		for (var i in this.index) {
			if (i != v) {
				this.index[i].deselect();
			} else {
				this.index[i].select();
				this.selected = this.index[i];
			}
		}
	}; // setValue()

	this.getValue = function() {
		if (this.selected) {
			return this.selected.value;
		} else {
			return undefined;
		}
	}; // getValue()

	onready(this.parameters, function() {
		for (var i = 0; i < _t.parameters.length; i++) {
			_t.add(_t.parameters[i]);
		}
	});

	setType(this, 'TG.UI.RadioGroup');
	onready(this).fire();
}; // TG.UI.RadioGroup
TG.UI.RadioGroup.templateMarkup = "<div data-id='container'></div>";
// TG.UI.RadioGroup.templateMarkup = "<div data-id='radioDiv'></div>";
_bindq.push(TG.UI.RadioGroup, '.tg-radio-group');


TG.UI.Radio = function() {
	// TG.UI.Field.call(this);

	var _t = this;

	this.style.display = 'inline-block';
	this.style.margin = '0.5em';

	this.value = this.value || this['data-value'] || '';

	this.select = function() {
		if (!this.fieldInput.checked) {
			this.fieldInput.checked = true;
			on(this, 'change').fire();
			on(this, 'select').fire();
		}
	}; // select()

	this.deselect = function() {
		if (this.fieldInput.checked) {
			this.fieldInput.checked = false;
			on(this, 'change').fire();
			on(this, 'deselect').fire();
		}
	}; // deselect()

	this.onclick = function() {
		on(this, 'selectaction').fire();
	}; // fieldInput.onchange()

	for (var i = 0; i < this.parameters.length; i++) {
		this.fieldLabel.appendChild(this.parameters[i]);
	}

	setType(this, 'TG.UI.Radio');
	onready(this).fire();
}; // TG.UI.Option
TG.UI.Radio.templateMarkup = "\
	<input type='radio' data-id='fieldInput'></input>\
	<label data-id='fieldLabel'></label>\
";
_bindq.push(TG.UI.Radio, '.tg-radio');


TG.UI.LoginLink = function() {

	var _t = this;
	this.isExpanded = false;

	this.toggle = function() {
		if (this.isExpanded) {
			this.collapse();
		} else {
			this.expand();
		}
	}; // toggle()

	this.expand = function() {
		this.isExpanded = true;
		this.loginBox.style.display = 'block';
		this.loginBox.focus();
	}; // expand()

	this.collapse = function() {
		this.isExpanded = false;
		this.loginBox.style.display = 'none';
	}; // collapse()

	this.actionLink.onclick = function() {
		_t.toggle(); return false;
	}; // actionLink.onclick()


	on(this.loginBox, 'submit', function(rv) {
		if (rv) {
			_t.collapse();
		}
	}); // loginBox.on(submit)

	/*
	TG.Users.onAuthChange().returnTo(function(user) {
		if (user && user.getUsername()) {
			_t.actionLink.innerHTML = "Sign out";
		} else {
			_t.actionLink.innerHTML = "Sign in";
		}
	});
	*/

	setType(this, 'TG.UI.LoginLink');
	onready(this).fire();
}; // TG.UI.LoginLink
TG.UI.LoginLink.templateMarkup = "\
	<a style='cursor: pointer;' data-id='actionLink'>Sign in</a>\
	<div data-id='loginBox' style='display: none; width: 300px;' class='tg-login-box'></div>\
";
_bindq.push(TG.UI.LoginLink, '.tg-login-link');


TG.UI.LoginBox = function() {
	var _t = this;

	onready(this, function() {
		if (_t.focused == 1) {
			_t.focus();
		} else {
			_t.blur();
		}
	});

	this.setMessage = function(m) {
		this.statusBox.innerHTML = m;
		this.statusBox.style.display = m ? '' : 'none';
	}; // setMessage()

	this.focus = function() {
		this.username.focus();
	}; // focus();

	this.blur = function() {
		this.username.blur();
		this.password.blur();
	}; // blur()

	this.submit = function() {
		TG.Users[this.action.getValue()](
			this.username.getValue(),
			this.password.getValue()
		).returnTo(function(rv) {
			if (rv) {
				_t.setMessage('Logging in ...');
			} else {
				_t.setMessage('Bad credentials. Try again.');
			}
			on(_t, 'submit').fire(rv);
		});
		this.password.setValue('');
	}; // submit()

	this.clear = function() {
		this.username.setValue('');
		this.password.setValue('');
	}; // clear()

	on(this.submitButton, 'submit', function() { _t.submit(); });

	this.formNode.onsubmit = function() {
		_t.submit();
		return false;
	}; // form.onsubmit()

	setType(this, 'TG.UI.LoginBox');
	onready(this).fire();
}; // TG.UI.LoginBox
TG.UI.LoginBox.templateMarkup = "\
	<div data-id='statusBox' style='display: none; color: red;'></div>\
	<form name='nosubmit' action='nosubmit' data-id='formNode'>\
	<div class='tg-radio-group' data-id='action'>\
		<div class='tg-radio' data-value='authenticate' selected='1'>Sign In</div>\
		<div class='tg-radio' data-value='add'>\
			Create Account\
		</div>\
	</div>\
	<div class='tg-field' data-id='username' data-name='Username'></div>\
	<div class='tg-password-field' data-id='password' data-name='Password'>\
	</div>\
	<div data-id='submitButton' class='tg-submit-button'></div>\
	</form>\
";
_bindq.push(TG.UI.LoginBox, '.tg-login-box');


TG.UI.DocumentList = function() {
}; // TG.UI.DocumentList


TG.UI.TestRun = function() {
	var _t = this;

	this.header.innerHTML = this.testobject;

	this.processResults = function(rv) {
		_t.loader.style.display = 'none';

		for (var i = 0; i < rv.failed.length; i++) {
			_t.appendChild(New(TG.UI.TestResult, rv.failed[i]));
		}

		for (var i = 0; i < rv.passed.length; i++) {
			_t.appendChild(New(TG.UI.TestResult, rv.passed[i]));
		}
	}; // processResults()

	this.run = function() {
		this.loader.style.display = '';
		upon(function() { return TG.UI.TestResult; }, function() {
			if (!TG.findGlobal(_t.testobject)) {
				var s = document.createElement('script');
				s.src = _t.api;
				s.type = 'text/javascript';
				document.body.appendChild(s);
			}

			upon(function() { return TG.findGlobal(_t.testobject); }, function() {
				TG.findGlobal(_t.testobject).run().returnTo(_t.processResults);
			});
		});
	}; // run()

	setType(this, 'TG.UI.TestRun');
	onready(this).fire();

	if (this.autorun == 1) { this.run(); }

}; // TG.UI.TestRun()
TG.UI.TestRun.templateMarkup = "\
	<h3 data-id='header'>Test Results</h3>\
	<div data-id='loader' style='color: silver; display: none;'>running ...</div>\
";
_bindq.push(TG.UI.TestRun, '.tg-test-run');


TG.UI.TestResult = function() {
	if (this.success) {
		this.style.color = 'green';
		this.successString.innerHTML = 'PASS';
	} else {
		this.style.color = 'red';
		this.successString.innerHTML = 'FAIL';
	}

	var m = '';
	if (typeof(this.message) == 'string') {
		m = this.message;
	} else if (typeof(this.message) !== 'undefined') {
		m = "<b>" + this.message.message + "</b>\n"
			+ "<i>" + this.message.fileName + ":"
				+ this.message.lineNumber
			+ "</i>\n"
			+ this.message.stack;
	}
	m = m.replace(/\n/g, "<br />\n");
	this.messageNode.innerHTML = m;
	
	if (TG.UI.alternate) {
		this.style.backgroundColor = '#f0f0ff';
	}
	TG.UI.alternate = !TG.UI.alternate;

	setType(this, 'TG.UI.TestResult');
	onready(this).fire();
}; // TestResult()
TG.UI.alternate = false;
TG.UI.TestResult.templateMarkup = "\
	<table style='width: 90%;'><tr>\
		<td data-id='successString' style='width: 30pt;'></td>\
		<td style='width: auto;'>\
			<div data-id='name' style='font-weight: bold;'></div>\
			<div data-id='messageNode'></div>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='duration'>0</span>\
		</td>\
		<td style='width: 10pt'>\
			<span style='color: silver;'>ms</span>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='reads'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>r</span>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='writes'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>w</span>\
		</td>\
		<td style='width: 25pt; text-align: right;'>\
			<span data-id='deletes'>0</span>\
		</td>\
		<td style='width: 8pt'>\
			<span style='color: silver;'>d</span>\
		</td>\
	</tr></table>\
";
_bindq.push(TG.UI.TestResult, '.tg-test-result');

