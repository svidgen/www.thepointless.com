const { DomClass } = require('wirejs-dom');
const Prompt = require('../prompt');

const template = `<tpdc:connector>
	<div data-id='actions'>
		<button data-id='makeCall'>Call</button>
		<button data-id='makeAnswer'>Answer</button>
	</div>
	<div data-id='step'></div>
</tpdc:connector>`;

const Connector = DomClass(template, function _Connector() {
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

	const chat = pc.createDataChannel('test', { negotiated: true, id: 1 });
	chat.onmessage = evt => {
		const { type, data } = JSON.parse(evt.data);
		self.dispatchEvent(new CustomEvent('message', {
			detail: { data }
		}));
	};

	// to replace with a connect() or something that eventually
	// returns a sender/receiver object.
	this.send = (message) => {
		chat.send(JSON.stringify({
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
		pc.onicecandidate = () => this.step.data = JSON.stringify(pc.localDescription);
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
		pc.onicecandidate = () => this.step.data = JSON.stringify(pc.localDescription);
		await this.step.next();

		this.step = 'Once your caller finishes the connection, stuff happens... i dunno';
	};

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

module.exports = Connector;