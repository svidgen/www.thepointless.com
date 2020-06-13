var CACHE_NAME = 'shooty-ship-pumpkin-smash-cache-v5';

var urlsToCache = [
	'index.html',
	'css/sheet.css',
	'js/tg-all.js',
	'js/tpdc.js',
	'js/game.js',
	'audio/pew-128.mp3',
	'audio/pkewh.mp3',
	'img/shiny.jpg',
	'img/shooty-ship-128x73.png',
	'img/shooty-ship-pumpkin-150x150.png',
	'img/candle-88x150.png',
	'img/mummy-93x150.png',
	'img/square-candy-colored-150x76.png',
	'img/round-red-candy-150x81.png',
	'img/shooty-ship-pumpkin-smash-icon.png',
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
				return fetch(url, {cache: 'no-cache'}).then(function(response) {
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
