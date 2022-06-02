self.addEventListener('periodicsync', () => {
	console.log('periodic sync handler reached');

	const notification = self.registration.showNotification("From periodic sync", {
		body: "Yep. We include a body here.",
		icon: "/images/favicon.ico"
	});

	// in theory, we can add onclick handlers to the nofitication.
	// we'll save that experiment for later. :D
})

self.addEventListener('install', function(event) {
	// no op. just a demo.
});


self.addEventListener('activate', function(event) {
	// no op. just a demo.
});

self.addEventListener('fetch', function(event) {
	return fetch(event.request);
});
