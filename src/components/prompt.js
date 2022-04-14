const { DomClass } = require('wirejs-dom');
const { Share } = require('./share');

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
		title='Ghost P2P call info'
		header='Ways to share your info:'
		methods='email,copy,native,qr'
	></tpdc:share>
	</div>
	<p>
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
