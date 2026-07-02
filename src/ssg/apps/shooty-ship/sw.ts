declare const self: ServiceWorkerGlobalScope;

const BUILD_ID = '00004';
const CACHE_NAME = `shooty-ship-cache-${BUILD_ID}`;
const STATIC_BASE = '/static/apps/shooty-ship/';

const appShellUrls = [
	'index.html',
	'manifest.json',
	'js/game.js',
	'js/game.css',
];

const staticAssetPaths = [
	'css/sheet-old.css',
	'audio/pew-128.mp3',
	'audio/pkewh.mp3',
	'img/shiny.jpg',
	'img/shooty-ship.png',
	'img/icon.png',
	'img/icon-180.png',
	'img/shooty-ship-icon-512.png',
	'img/shooty-ship-rock-150x150.png',
	'img/fb_icon_22px.png',
	'img/twitter_logo_22px.png',
	'img/email_logo_22px_h.png',
	'img/native-share.svg',
	'img/qr-code.svg',
];

const urlsToCache = [
	...appShellUrls,
	...staticAssetPaths.map(path => `${STATIC_BASE}${path}`),
];

function staticUrlFor(request: Request) {
	const url = new URL(request.url);
	const prefix = '/apps/shooty-ship/';

	if (url.origin === location.origin && url.pathname.startsWith(prefix)) {
		const appPath = url.pathname.slice(prefix.length);
		if (appPath.startsWith('img/') || appPath.startsWith('audio/') || appPath.startsWith('css/')) {
			return `${STATIC_BASE}${appPath}`;
		}
	}
}

export function hydrate() {
	self.addEventListener('install', function(event) {
		event.waitUntil(
			caches.open(CACHE_NAME).then(function(cache) {
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
		const staticUrl = staticUrlFor(event.request);
		const request = staticUrl || event.request;

		event.respondWith(
			fetch(request).catch(function() {
				return caches.match(request);
			})
		);
	});
}
