const { DomClass } = require('wirejs-dom');
const Connector = require('/src/components/p2p/connector');
const QRCode = require('qrcode');

const template = `<p2p:index>
	<h2 data-id='title'>
	<img src='./img/icon.svg'
		style='height: 1.5em; vertical-align: bottom;' />
		Ghost P2P
	</h2>
	<h4>A WebRTC Experiment (WIP)</h4>
	<p>This is us playing with manual WebRTC negotation options.
		Our hope is to demonstrate patterns for decentralized apps that are 
		interoperable with the centralized web you're used to &mdash;
		but are minimally reliant on it <i>if at all</i>.
	</p>
	<tpdc:connector data-id='connector'></tpdc:connector>
	<div data-id='messaging' style='display: none'>
		<h3>Messages</h3>
		<p>(🔒 WebRTC is secure by default.)</p>
		<div>
			<textarea data-id='messages'
				readonly
				data-target='value'
				style='width: 80vw; height: 10em;'
			></textarea>
		</div>
		<div>
			<input
				type='text'
				data-id='message'
				data-property='value'
			/>
			<button data-id='sendButton'>Send</button>
		</div>
	</div>
</p2p:index>`;

const Index = DomClass(template, function _Index() {
	const self = this;

	this.messages = '';
	this._messages = [];

	this.clear = function() {
		this._messages = [];
		this.messages = '';
	}

	this.addMessage = (m) => {
		this._messages.push(m);
		this.messages = this._messages.join('\n');
	};

	this.connector.addEventListener('connected', evt => {
		console.log('connected?');
		this.messaging.style.display = '';
		this.connector.style.display = 'none';
	});

	this.connector.addEventListener('disconnected', evt => {
		this.addMessage('DISCONNECTED.');
		this.addMessage('Reloading in 10 seconds... ');
		setTimeout(() => {
			location.reload();
		}, 10000);
	});

	this.connector.addEventListener('message', evt => {
		this.addMessage(`received: ${evt.detail.data}`);
	});

	this.__dom.sendButton.onclick = () => {
		this.connector.send(this.message);
		this.addMessage(`sent: ${this.message}`);
		this.message = '';
	}
});

module.exports = Index;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}');
};
