const { DomClass } = require('wirejs-dom');
const { Share } = require('../share');

const template = `<tpdc:prompt>
	<h3 data-id='header'></h3>
	<p data-id='instructions'></p>
	<textarea
		readonly
		style='display: none';
		data-id='data'
		data-property='value'
		style='width: 80vw; height: 10em;'
	></textarea>
	<tpdc:share
		data-id='share'
		title='Ghost P2P call link'
		header='Ways to share your link:'
		methods='email,copy,native,qr,preview'
	></tpdc:share>
	</div>
	<p style='display: none'>
		<button data-id='nextButton'>Continue</button>
	</p>
</tpdc:prompt>`;

const Prompt = DomClass(template, function _Prompt() {
	this.isNextClicked = false;
	this.resolvers = [];

	if (this.data) {
		this.share.title = '';
		this.share.text = this.data;
	} else {
		this.share.style.display = 'none';
		this.__dom.data.readOnly = false;
	}

	this.share.getObject = () => ({
		title: "My Call Link",
		text: "Click this to get connected with me:",
		url: this.data
	});

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

	this.complete = function(data) {
		this.data = data;
		this.resolvers.forEach(resolve => resolve(data));
	}
});

module.exports = Prompt;
