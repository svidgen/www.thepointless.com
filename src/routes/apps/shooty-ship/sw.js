const BUILD_ID = require('/src/build_id.json');

const CACHE_NAME = 'shooty-ship-cache-' + BUILD_ID;

const urlsToCache = [
	'index.html',
	'manifest.json',
	'css/sheet.css',
	'js/game.js',
	'audio/pew-128.mp3',
	'audio/pkewh.mp3',
	'img/shiny.jpg',
	'img/shooty-ship.png',
	'img/icon.png',
	'img/fb_icon_22px.png',
	'img/twitter_logo_22px.png',
	'img/email_logo_22px_h.png',
	'img/native-share.svg',
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
