const { DomClass } = require('wirejs-dom');

const template = `<tpdc:prompt>
	<h3 data-id='header'></h3>
	<p data-id='instructions'></p>
	<textarea
		data-id='data'
		data-property='value'		
		rows='10' cols='80'
	></textarea>
	<p>
		<button data-id='nextButton'>Continue</button>
	</p>
</tpdc:prompt>`;

const Prompt = DomClass(template, function _Prompt() {
	const self = this;

	this.isNextClicked = false;
	this.resolvers = [];

	// this.data.readonly = this.readonly;

	this.__dom.nextButton.onclick = () => {
		this.isNextClicked = true;
		this.resolvers.forEach(resolve => resolve(this.data));
	};

	this.next = function() {
		if (this.isNextClicked) return this.data;
		return new Promise((resolve) => {
			this.resolvers.push(resolve);
		});
	};
});

module.exports = Prompt;