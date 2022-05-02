const { DomClass } = require('wirejs-dom');

const markup = `<ft:radio>
	<input type='radio' data-id='radio' />
	<label data-id='label'></label>
</ft:radio>`;

let radio_count = 0;

const Radio = DomClass(markup, function _Radio() {
	radio_count++;
	const id = `radio_${radio_count}`;

	this.label = this.value;
	this.radio = this.value;

	this.__dom.radio.id = id;
	this.__dom.label.setAttribute('for', id);
	this.__dom.radio.name = this.name;
	this.__dom.radio.onclick = () => {
		if (typeof this.onselect === 'function') {
			this.onselect(this.value);
		}
	}
});

module.exports = Radio;