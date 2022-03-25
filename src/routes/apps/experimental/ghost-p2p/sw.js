const BUILD_ID = require('/src/build_id.json');

const CACHE_NAME = 'experimental-p2p-push-' + BUILD_ID;

const urlsToCache = [
	'index.html',
	'manifest.json',
	'js/index.js'
];

self.onpush = function(event) {
	if (!(self.Notification && self.Notification.permission === 'granted')) {
		return;
	  }
	
	  var data = {};
	  if (event.data) {
		data = event.data.json();
	  }
	  var title = data.title || "Something Has Happened";
	  var message = data.message || "Here's something you might want to check out.";
	  var icon = "images/new-notification.png";
	
	  var notification = new Notification(title, {
		body: message,
		tag: 'simple-push-demo-notification',
		icon: icon
	  });
	
	  notification.addEventListener('click', function() {
		if (clients.openWindow) {
		  clients.openWindow('https://example.blog.com/2015/03/04/something-new.html');
		}
	  });
};

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(CACHE_NAME).then(function(cache) {
			console.log('Opened cache');
			// return cache.addAll(urlsToCache);
			return Promise.all(urlsToCache.map(function(url) {
				return fetch(url, {
					cache: 'no-cache',
					credentials: 'include'
				}).then(function(response) {
					return cache.put(url, response);
				});
			}));
		})
	);
});


self.addEventListener('activate', function(event) {
	var cacheWhitelist = [CACHE_NAME];
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});


self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			// Cache hit - return response
			if (response) {
				return response;
			}
			return fetch(event.request);
		})
	);
});
