const { DomClass } = require('wirejs-dom');
const QRCode = require('qrcode');

const template = `<p2p:index>
	<h2 data-id='title'>WebRTC Negotation</h2>

	<h3>Offer</h3>
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

	this.messages = '';
	this._messages = [];

	this.log = function(...messages) {
		messages.forEach(message => this._messages.push(JSON.stringify(message)));
		this.messages = this._messages.join('\n\n');
	};

	const url = new URL(location);
	const query = url.searchParams;
	const CANDIDATE = query.get('c');
	const DESC = query.get('o');

	const pc = new RTCPeerConnection({
		iceServers: [
			// single google STUN server for development.
			// will use git repo of public STUN servers once live.
			{ urls: 'stun:stun3.l.google.com:19302' }
		]
	});
	pc.ondatachannel = (event) => {
		_t.log('ondatachannel', event);
		const rc = event.channel;
		rc.onmessage = evt => {
			_t.log('onmessage', evt, evt.data);
		}
	};
	const dc = pc.createDataChannel('test')

	// for debugging/development
	window.pc = pc;
	window.dc = dc;

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

	this.__dom.ping.onclick = async function() {
		dc.send('ping');
	}

	dc.onmessage = e => {
		try {
			_t.log('onmessage', JSON.parse(e));
			setTimeout(() => {
				dc.send(JSON.stringify('hello'));
			}, 1000);
		} catch (err) {
			console.error('could not parse', err);
		}
	};
	
	dc.onopen = function () {
		_t.log('on open');
		setTimeout(() => {
			_t.log('sending a message');
			dc.send(JSON.stringify('hello, server'));
		}, 1000)
		
	};

	pc.onicecandidate = (event) => {
		if (event.candidate) {
			this.log('onicecandidate', event.candidate)
		} else {
			this.log('onicecandidate no candidate', event);
		}
		this.offer = JSON.stringify(pc.localDescription);
		// if (DESC) {
		// 	this.log('what do we do now?');
		// } else if (event.candidate) {
		// 	// sendCandidateToRemotePeer(event.candidate)
		// 	this.log('event with candidate', event);
		// 	const candidate = encodeURIComponent(JSON.stringify(event.candidate));
		// 	const offer = encodeURIComponent(JSON.stringify(pc.localDescription));
		// 	// const candidateUrl = `${location.href}?c=${candidate}&o=${offer}`;
		// 	// const offerURL = `${location.href}?o=${offer}`;
			
		// 	// QRCode.toCanvas(offerURL, {}, (err, canvas) => {
		// 	// 	if (err) throw err;
	
		// 	// 	document.body.appendChild(canvas);
		// 	// 	const infos = document.createElement('div');
		// 	// 	const link = document.createElement('a');
		// 	// 	link.href = offerURL;
		// 	// 	link.innerHTML = 'test ' + event.candidate.address;
		// 	// 	link.target = '_blank';
		// 	// 	infos.appendChild(link);
		// 	// 	document.body.appendChild(infos);
		// 	// });
		// } else {
		// 	/* there are no more candidates coming during this negotiation */
		// 	this.log('shrug', event);
		// }
	};
	
	if (DESC || CANDIDATE) {
		if (CANDIDATE) {
			this.log('candidate given', CANDIDATE);
			const candidate = new RTCIceCandidate(JSON.parse(CANDIDATE));
			pc.addIceCandidate(candidate);
		}
	
		this.log('offer received', JSON.parse(DESC));
		pc.setRemoteDescription(JSON.parse(DESC)).then(() => {
			pc.createAnswer().then(answer => {
				this.log('answer', answer)
				pc.setLocalDescription(answer);
			})
		});
	} else {
		// this.log('no offer present. creating one');
		// pc.createOffer().then(async function (offer) {
		// 	await pc.setLocalDescription(offer);
		// 	this.log('pc.localDescription', pc.localDescription);
		// });
	}
	
	pc.onnegotiationneeded = async () => {
		this.log('no offer present. creating one');
		const offer = await pc.createOffer();
		await pc.setLocalDescription(offer);
		this.log('pc.localDescription', pc.localDescription);
	};
});

module.exports = Index;

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}').then((swr) => {
		// swr.pushManager.subscribe({userVisibleOnly: true}).then((sub) => {
		// 	this.log(sub);
		// }).catch((error) => {
		// 	console.error('error', error);
		// })
	})
};
