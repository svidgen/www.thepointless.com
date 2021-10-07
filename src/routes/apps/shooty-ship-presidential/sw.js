var CACHE_NAME = 'shooty-ship-presidential-cache-v5';

var urlsToCache = [
	'index.html',
	'css/sheet.css',
	'js/tg-all.js',
	'js/tpdc.js',
	'js/game.js',
	'audio/pew-128.mp3',
	'audio/pkewh.mp3',
	'img/shiny.jpg',
	'img/shooty-ship.png',
	'img/fb_icon_22px.png',
	'img/twitter_logo_22px.png',
	'img/email_logo_22px_h.png',
	'img/native-share.svg',
	'img/believe-me.png',
	'img/big.png',
	'img/definitely.png',
	'img/fake-news.png',
	'img/huge.png',
	'img/maybe.png',
	'img/probably.png',
	'img/really.png',
	'img/trump-1-tl.png',
	'img/trump-2-tl.png',
	'img/trump-3-tl.png',
	'img/trump-4-tl.png',
	'img/trump-5-tl.png',
	'img/trump-6-tl.png',
	'img/youre-fired.png',
	'img/zero.png',
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
