const { DomClass } = require('wirejs-dom');
const QRCode = require('qrcode');

const template = `<p2p:index>
	<h2 data-id='title'>WebRTC Negotation</h2>

	<h3>Offer (or Answer)</h3>
	<textarea data-id='offer'
		readonly
		data-property='value'		
		rows='10' cols='80'
	></textarea>
	<button data-id='callButton'>Call</button>

	<h3>Answer</h3>
	<textarea data-id='answer'
		data-property='value'
		rows='10' cols='80'
	></textarea>
	<button data-id='answerButton'>Connect</button>

	<button data-id='ping'>Ping</button>

	<h3>Messages</h3>
	<textarea data-id='messages'
		readonly
		data-target='value'
		rows='25' cols='80'
	></pre>

</p2p:index>`;

const Index = DomClass(template, function _Index() {
	const _t = this;

	const url = new URL(location);

	this.messages = '';
	this._messages = [];

	this.log = function(...messages) {
		messages.forEach(message => this._messages.push(JSON.stringify(message)));
		this.messages = this._messages.join('\n\n');
	};

	const pc = new RTCPeerConnection({
		iceServers: [
			// single google STUN server for development.
			// will use git repo of public STUN servers once live.
			{ urls: 'stun:stun3.l.google.com:19302' }
		]
	});

	const dc = pc.createDataChannel('test')

	// for debugging/development
	window.pc = pc;
	window.dc = dc;

	pc.addEventListener('datachannel', event => {
		_t.log('ondatachannel', event);
		const rc = event.channel;
		rc.onmessage = evt => {
			_t.log('onmessage', evt, evt.data);
		}
	});

	this.__dom.answerButton.onclick = async function() {
		const message = JSON.parse(_t.answer);
		await pc.setRemoteDescription(new RTCSessionDescription(message));
		if (message.type === 'offer') {
			await pc.setRemoteDescription(new RTCSessionDescription(message));
			const answer = pc.createAnswer();
			pc.setLocalDescription(answer);
			_t.offer = JSON.stringify(pc.localDescription);
			_t.log('answering ...');
		} else if (message.type === 'answer') {
			_t.log('answered. connecting...')
		}
	};

	this.__dom.ping.addEventListener('click', async event => {
		dc.send('ping');
	});

	dc.addEventListener('message', e => {
		try {
			_t.log('onmessage', JSON.parse(e));
			setTimeout(() => {
				dc.send(JSON.stringify('hello'));
			}, 1000);
		} catch (err) {
			console.error('could not parse', err);
		}
	});
	
	dc.addEventListener('open', event => {
		// signal to the app that messages can be sent now.
		// or start drainging the message queue or whatever.
		_t.log('on open');
		setTimeout(() => {
			_t.log('sending a message');
			dc.send(JSON.stringify('hello, server'));
		}, 1000)
	});

	dc.addEventListener('close', event => {
		// stop transmitting. if there's an item in the buffer to
		// be written, put it back into local storage. make callbacks. etc.
	});

	pc.addEventListener('icecandidate', event => {
		if (event.candidate) {
			this.log('onicecandidate', event.candidate)
		} else {
			this.log('onicecandidate no candidate', event);
		}

		// send the offer to the other party
		this.offer = JSON.stringify(pc.localDescription);
	});

	pc.addEventListener('connectionstatechange', event => {
		if (event === 'disconnected' || event === 'closed') {
			// clean things up!
			// turn audio/video feeds off.
			// notify the user that the session has ended.
			// etc.
		}
	});

	pc.addEventListener('negotiationneeded', async event => {
			this.log('no offer present. creating one');
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);
			this.log('pc.localDescription', pc.localDescription);
	});

});

module.exports = Index;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}');
};
