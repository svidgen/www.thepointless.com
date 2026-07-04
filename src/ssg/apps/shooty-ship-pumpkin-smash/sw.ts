declare const self: ServiceWorkerGlobalScope;

const BUILD_ID = '00001';
const CACHE_NAME = `shooty-ship-pumpkin-smash-cache-${BUILD_ID}`;
const APP_PREFIX = '/apps/shooty-ship-pumpkin-smash/';
const STATIC_BASE = '/static/apps/shooty-ship-pumpkin-smash/';

const appShellUrls = ['index.html', 'manifest.json', '/apps/shooty-ship/js/game.js', '/apps/shooty-ship/js/game.css'];
const staticAssetPaths = [
	'css/sheet-old.css',
	'css/sheet.css',
	'css/index.css',
	'img/mummy-93x150.png',
	'img/shiny.jpg',
	'img/icon.png',
	'img/round-red-candy-150x81.png',
	'img/shooty-ship-pumpkin-150x150.png',
	'img/shooty-ship-rock-150x150.png',
	'img/twitter_logo_22px.png',
	'img/native-share.svg',
	'img/qr-code.svg',
	'img/candle-88x150.png',
	'img/fb_icon_22px.png',
	'img/shooty-ship.png',
	'img/email_logo_22px_h.png',
	'img/shooty-ship-128x73.png',
	'img/square-candy-colored-150x76.png',
	'audio/pew-128.mp3',
	'audio/pkewh.mp3',
];
const urlsToCache = [...appShellUrls, ...staticAssetPaths.map(path => `${STATIC_BASE}${path}`)];

function staticUrlFor(request: Request) {
	const url = new URL(request.url);
	if (url.origin === location.origin && url.pathname.startsWith(APP_PREFIX)) {
		const appPath = url.pathname.slice(APP_PREFIX.length);
		if (appPath.startsWith('img/') || appPath.startsWith('audio/') || appPath.startsWith('css/')) {
			return `${STATIC_BASE}${appPath}`;
		}
	}
}

export function onload() {
	self.addEventListener('install', event => {
		event.waitUntil(caches.open(CACHE_NAME).then(cache => Promise.all(urlsToCache.map(url => fetch(url, { cache: 'no-cache', credentials: 'include' }).then(response => cache.put(url, response))))));
	});

	self.addEventListener('activate', event => {
		event.waitUntil(caches.keys().then(cacheNames => Promise.all(cacheNames.map(cacheName => cacheName === CACHE_NAME ? undefined : caches.delete(cacheName)))));
	});

	self.addEventListener('fetch', event => {
		const staticUrl = staticUrlFor(event.request);
		const request = staticUrl || event.request;
		event.respondWith(fetch(request).catch(() => caches.match(request)));
	});
}
