const { DomClass } = require('wirejs-dom');
const Connector = require('/src/components/p2p/connector');
const QRCode = require('qrcode');

const template = `<p2p:index>
	<h2 data-id='title'>WebRTC Manual Negotation Experiment (WIP)</h2>
	<p>Just learning WebRTC to see if we can do anything fun with it.</p>
	<tpdc:connector data-id='connector'></tpdc:connector>
	<div data-id='messaging'>
		<h3>Messages</h3>
		<div>
			<textarea data-id='messages'
				readonly
				data-target='value'
				rows='25' cols='80'
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

	this.connector.addEventListener('message', (evt) => {
		this._messages.push(`received: ${evt.detail.data}`);
		this.messages = this._messages.join('\n');
	});

	this.__dom.sendButton.onclick = () => {
		this.connector.send(this.message);
		this._messages.push(`sent: ${this.message}`);
		this.messages = this._messages.join('\n');
		this.message = '';
	}
});

module.exports = Index;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}');
};
