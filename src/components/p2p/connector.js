const { DomClass } = require('wirejs-dom');
const Prompt = require('../prompt');

const serialize = o => btoa(JSON.stringify(o));
const deserialize = o => JSON.parse(atob(o));

const template = `<tpdc:connector>
	<div data-id='actions'>
		<button data-id='makeCall'>Call</button>
		<button data-id='makeAnswer'>Answer</button>
		<button data-id='startOver' style='display: none;'>Start Over</button>
	</div>
	<div data-id='step'></div>
</tpdc:connector>`;

const Connector = DomClass(template, function _Connector() {
	const self = this;

	// TODO: read call from URL if present.
	const url = new URL(location);
	const startingOffer = url.searchParams.get('o');

	this.log = function(...messages) {
		console.log(...messages);
	};

	this.debug = function(...messages) {
		console.debug(...messages);
	};

	this.error = function(...messages) {
		console.error(...messages);
	};

	const pc = new RTCPeerConnection({
		iceServers: [
			// single google STUN server for development.
			// will use git repo of public STUN servers once live.
			// negotation apparently fires off messages to all servers at once,
			// so we might want to keep a pool of 20 or so and pick 3 rando.
			{ urls: 'stun:stun3.l.google.com:19302' }
		]
	});

	const control = pc.createDataChannel('control', { negotiated: true, id: 1 });
	control.onmessage = evt => {
		// noop for now
	};

	const chat = pc.createDataChannel('chat', { negotiated: true, id: 2 });
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

	this.__dom.startOver.onclick = () => location.reload();

	this.__dom.makeCall.onclick = async () => {
		this.__dom.makeCall.style.display = 'none';
		this.__dom.makeAnswer.style.display = 'none';
		this.__dom.startOver.style.display = '';

		this.step = new Prompt({
			header: 'Getting ready to connect',
			instructions: `<ol>
				<li>Instruct the other caller needs to click "answer".</li>
				<li>Send your <b>connection data</b> to the other caller.</li>
				<li>Click "Continue".</li>
			</ol>`,
			data: serialize(pc.localDescription),
			readonly: true,
		});
		pc.onicecandidate = () => this.step.data = JSON.stringify(pc.localDescription);
		await this.step.next();

		this.step = new Prompt({
			header: "Waiting for an answer",
			instructions: `When your other caller gives you their connection info, put it here and click "Continue".`,
		})
		const answer = deserialize(await this.step.next());
		await pc.setRemoteDescription(new RTCSessionDescription(answer));

		this.step = 'All set!';
	};

	// this.__dom.makeAnswer.onclick = async () => {
	setTimeout(async () => {
		if (!startingOffer) return;

		this.__dom.makeCall.style.display = 'none';
		this.__dom.makeAnswer.style.display = 'none';
		this.__dom.startOver.style.display = '';

		/*
		this.step = new Prompt({
			header: 'Caller Info',
			instructions: `Put the call info you were given here and click "Next".`,
		});
		const offer = deserialize(await this.step.next());
		*/

		const offer = deserialize(startingOffer);
		
		await pc.setRemoteDescription(new RTCSessionDescription(offer));
		const answer = pc.createAnswer();
		await pc.setLocalDescription(answer);

		this.step = new Prompt({
			header: 'Your Call Info',
			instructions: `Give this info to your caller to finish connecting.`,
			data: serialize(pc.localDescription),
			readonly: true
		});
		pc.onicecandidate = () => this.step.data = serialize(pc.localDescription);
		await this.step.next();

		this.step = `Once your caller finishes the connection, we'll give you secure, peer-to-peer chat to use!`;
	}, 1);
	// };

	pc.addEventListener('connectionstatechange', event => {
		const state = pc.connectionState;
		switch (state) {
			case 'new':
			case 'connecting':
				this.debug('Not yet connected.');
				this._onConnecting && this._onConnecting.resolve();
				self.dispatchEvent(new CustomEvent('connecting'));
				break;

			case 'connected':
				this.log('connected');
				self.dispatchEvent(new CustomEvent('connected'));
				self.step = '';
				break;

			case 'disconnected':
			case 'failed':
			case 'closed':
				this.log('disconnected');
				self.dispatchEvent(new CustomEvent('disconnected'));
				break;

			default:
				this.error(`Unknown PC state: ${state}`);
		}
	});

	pc.addEventListener('negotiationneeded', async event => {
		this.debug('no offer present. creating one');
		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		this.debug('pc.localDescription', pc.localDescription);
	});

});

module.exports = Connector;
