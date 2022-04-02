const { ConsoleLogger } = require('@aws-amplify/core');
const QRCode = require('qrcode');

const url = new URL(location);
const query = url.searchParams;
const CANDIDATE = query.get('c');
const DESC = query.get('o');

pc = new RTCPeerConnection({
	iceServers: [
		{ urls: 'stun:stun3.l.google.com:19302' }
	]
});
dc = pc.createDataChannel('test')

dc.addEventListener("open", (event) => {
	// beginTransmission(dataChannel);
	console.log('open', event);
});

dc.onmessage = e => {
	try {
		console.log('onmessage', JSON.parse(e.data));
		setTimeout(() => {
			dc.send(JSON.stringify('hello'));
		}, 1000);
	} catch (err) {
		console.error('could not parse', err);
	}
};

dc.onopen = function () {
	console.log('on open');
	dc.send(JSON.stringify('hello, server'));
};

pc.onicecandidate = (event) => {
	if (DESC) {
		console.log('what do we do now?');
	} else if (event.candidate) {
		// sendCandidateToRemotePeer(event.candidate)
		console.log('event with candidate', event);
		const candidate = encodeURIComponent(JSON.stringify(event.candidate));
		const offer = encodeURIComponent(JSON.stringify(pc.localDescription));
		// const candidateUrl = `${location.href}?c=${candidate}&o=${offer}`;
		const offerURL = `${location.href}?o=${offer}`;
		
		QRCode.toCanvas(offerURL, {}, (err, canvas) => {
			if (err) throw err;

			document.body.appendChild(canvas);
			const infos = document.createElement('div');
			const link = document.createElement('a');
			link.href = offerURL;
			link.innerHTML = 'test ' + event.candidate.address;
			link.target = '_blank';
			infos.appendChild(link);
			document.body.appendChild(infos);
		});
	} else {
		/* there are no more candidates coming during this negotiation */
		console.log('shrug', event);
	}
};

if (DESC || CANDIDATE) {
	if (CANDIDATE) {
		console.log('candidate given', CANDIDATE);
		const candidate = new RTCIceCandidate(JSON.parse(CANDIDATE));
		pc.addIceCandidate(candidate);
	}

	console.log('offer received', JSON.parse(DESC));
	pc.setRemoteDescription(JSON.parse(DESC)).then(() => {
		pc.createAnswer().then(answer => {
			console.log('answer', answer)
			pc.setLocalDescription(answer);
		})
	});
} else {
	console.log('no offer present. creating one');
	pc.createOffer().then(async function (offer) {
		await pc.setLocalDescription(offer);
		console.log('pc.localDescription', pc.localDescription);
	});
}


if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}').then((swr) => {
		// swr.pushManager.subscribe({userVisibleOnly: true}).then((sub) => {
		// 	console.log(sub);
		// }).catch((error) => {
		// 	console.error('error', error);
		// })
	})
};
