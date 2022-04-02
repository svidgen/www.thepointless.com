const QRCode = require('qrcode');

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
			dc.send(JSON.stringify('hello, client.'));
		}, 1000);
	} catch (err) {
		console.error('could not parse', err);
	}
};

pc.onicecandidate = (event) => {
	if (event.candidate) {
		// sendCandidateToRemotePeer(event.candidate)
		const candidate = encodeURIComponent(event.candidate.candidate);
		const url = `${location.href}?c=${candidate}`;
		QRCode.toCanvas(url, {}, (err, canvas) => {
			if (err) throw err;
			document.body.appendChild(canvas);
		});
		const link = document.createElement('a');
		link.href = url;
		link.innerHTML = 'test';
		link.target = '_blank';
		document.body.appendChild(link);
		console.log('event', event, url);
	} else {
		/* there are no more candidates coming during this negotiation */
	}
};

pc.createOffer().then(function (offer) {
	console.log('offer', offer);
	return pc.setLocalDescription(offer);
}).then(function () {
	console.log({
		//   name: myUsername,
		//   target: targetUsername,
		//   type: "video-offer",
		type: 'data-offer',
		sdp: pc.localDescription
	});
}).catch(function (reason) {
	console.log('reason', reason);
	// An error occurred, so handle the failure to connect
});

//   pc.addEventListener("negotiationneeded", ev => {
// 	pc.createOffer()
// 	.then(offer => pc.setLocalDescription(offer))
// 	.then(() => sendSignalingMessage({
// 	  type: "video-offer",
// 	  sdp: pc.localDescription
// 	}))
// 	.catch(err => {
// 	  /* handle error */
// 	});
//   }, false);

// pc.

// self.onpush = function(event) {
// 	if (!(self.Notification && self.Notification.permission === 'granted')) {
// 		return;
// 	  }

// 	  var data = {};
// 	  if (event.data) {
// 		data = event.data.json();
// 	  }
// 	  var title = data.title || "Something Has Happened";
// 	  var message = data.message || "Here's something you might want to check out.";
// 	  var icon = "images/new-notification.png";

// 	  var notification = new Notification(title, {
// 		body: message,
// 		tag: 'simple-push-demo-notification',
// 		icon: icon
// 	  });

// 	  notification.addEventListener('click', function() {
// 		if (clients.openWindow) {
// 		  clients.openWindow('https://example.blog.com/2015/03/04/something-new.html');
// 		}
// 	  });
// };

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}').then((swr) => {
		// swr.pushManager.subscribe({userVisibleOnly: true}).then((sub) => {
		// 	console.log(sub);
		// }).catch((error) => {
		// 	console.error('error', error);
		// })
	})
};
