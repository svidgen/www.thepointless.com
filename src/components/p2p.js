const { DomClass } = require('wirejs-dom');
const Prompt = require('./prompt');

const template = `<tpdc:p2p>
	<div data-id='actions'>
		<button data-id='makeCall'>Call</button>
		<button data-id='makeAnswer'>Answer</button>
	</div>
	<div data-id='step'></div>
</tpdc:p2p>`;

const Index = DomClass(template, function _Index() {
	const self = this;

	// TODO: read call from URL if present.
	const url = new URL(location);

	this.log = function(...messages) {
		console.log(...messages);
	};

	const pc = new RTCPeerConnection({
		iceServers: [
			// single google STUN server for development.
			// will use git repo of public STUN servers once live.
			{ urls: 'stun:stun3.l.google.com:19302' }
		]
	});

	const dc = pc.createDataChannel('test');
	let connected = false;
	
	dc.addEventListener('open', event => {
		connected = true;
		// resolve();
	});

	dc.addEventListener('close', event => {
		// stop transmitting. if there's an item in the buffer to
		// be written, put it back into local storage. make callbacks. etc.
	});

	this.localDescription = '';
	this.answer = '';

	// to replace with a connect() or something that eventually
	// returns a sender/receiver object.
	this.send = (message) => {
		dc.send(JSON.stringify({
			type: 'message', data: message
		}));
	}

	this.__dom.makeCall.onclick = async () => {
		this.step = new Prompt({
			header: 'Your Call Info',
			instructions: 'Send this to your callee.',
			data: JSON.stringify(pc.localDescription),
			readonly: true,
		});
		await this.step.next();

		this.step = new Prompt({
			header: 'Callee Info',
			instructions: 'When your callee gives you their info, put it here.',
		})
		const answer = JSON.parse(await this.step.next());
		await pc.setRemoteDescription(new RTCSessionDescription(answer));

		this.step = 'All set!';
	};

	this.__dom.makeAnswer.onclick = async () => {
		this.step = new Prompt({
			header: 'Caller Info',
			instructions: "Put the call info you were given here.",
		});
		const offer = JSON.parse(await this.step.next());
		
		await pc.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = pc.createAnswer();
		await pc.setLocalDescription(answer);

		this.step = new Prompt({
			header: 'Your Call Info',
			instructions: 'Give this info to your caller to finish connecting.',
			data: JSON.stringify(pc.localDescription),
			readonly: true
		});
		await this.step.next();

		this.step = 'Once your caller finishes the connection, stuff happens... i dunno';
	};

	pc.addEventListener('datachannel', event => {
		self.log('ondatachannel', event);
		const channel = event.channel;
		channel.onmessage = evt => {
			const { type, data } = JSON.parse(evt.data);
			if (type === 'message') {
				self.dispatchEvent(new CustomEvent('message', {
					detail: { data }
				}));
			} else {
				// control message.
				// no control messages implemented yet.
			}
		}
	});

	pc.addEventListener('icecandidate', event => {
		if (event.candidate) {
			this.log('onicecandidate', event.candidate)
		} else {
			this.log('onicecandidate no candidate', event);
		}

		// send the offer to the other party
		this.offer = JSON.stringify(pc.localDescription);

		// after connection is established, can we send new candidates
		// through the peer connection? (in case ice restart is needed,
		// for example.)
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