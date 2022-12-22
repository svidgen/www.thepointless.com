const BUILD_ID = require('/src/build_id.json');

const CACHE_NAME = 'experimental-p2p-push-' + BUILD_ID;

const urlsToCache = [
	'index.html',
	'manifest.json',
	'js/index.js',
	'img/icon-min.svg'
];


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
