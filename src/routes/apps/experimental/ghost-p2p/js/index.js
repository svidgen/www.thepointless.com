console.log('here i am')

pc = new RTCPeerConnection([]);

pc.onicecandidate = (event) => {
	if (event.candidate) {
	  // sendCandidateToRemotePeer(event.candidate)
	  console.log(event);
	} else {
	  /* there are no more candidates coming during this negotiation */
	}
  }

  pc.createOffer().then(function(offer) {
	  console.log(offer);
    return pc.setLocalDescription(offer);
  })
  .then(function() {
    console.log({
    //   name: myUsername,
    //   target: targetUsername,
    //   type: "video-offer",
      sdp: pc.localDescription
    });
  })
  .catch(function(reason) {
	  console.log(reason);
    // An error occurred, so handle the failure to connect
  });

  pc.addEventListener("negotiationneeded", ev => {
	pc.createOffer()
	.then(offer => pc.setLocalDescription(offer))
	.then(() => sendSignalingMessage({
	  type: "video-offer",
	  sdp: pc.localDescription
	}))
	.catch(err => {
	  /* handle error */
	});
  }, false);

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