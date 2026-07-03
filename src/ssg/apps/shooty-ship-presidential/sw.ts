declare const self: ServiceWorkerGlobalScope;

const BUILD_ID = '00001';
const CACHE_NAME = `shooty-ship-presidential-cache-${BUILD_ID}`;
const APP_PREFIX = '/apps/shooty-ship-presidential/';
const STATIC_BASE = '/static/apps/shooty-ship-presidential/';

const appShellUrls = ['index.html', 'manifest.json', '/apps/shooty-ship/js/game.js', '/apps/shooty-ship/js/game.css'];
const staticAssetPaths = [
	'css/sheet-old.css',
	'css/sheet.css',
	'css/index.css',
	'img/shiny.jpg',
	'img/icon.png',
	'img/trump-2-tl.png',
	'img/youre-fired.png',
	'img/trump-6-tl.png',
	'img/trump-4-tl.png',
	'img/shooty-ship-pumpkin-smash-icon.png',
	'img/shooty-ship-pumpkin-150x150.png',
	'img/zero.png',
	'img/huge.png',
	'img/big.png',
	'img/definitely.png',
	'img/trump-1.png',
	'img/believe-me.png',
	'img/trump-1-tl.png',
	'img/trump-2.png',
	'img/trump-3.png',
	'img/twitter_logo_22px.png',
	'img/trump-3-tl.png',
	'img/trump-6.png',
	'img/trump-4.png',
	'img/trump-5.png',
	'img/probably.png',
	'img/native-share.svg',
	'img/qr-code.svg',
	'img/fb_icon_22px.png',
	'img/really.png',
	'img/maybe.png',
	'img/shooty-ship.png',
	'img/email_logo_22px_h.png',
	'img/trump-5-tl.png',
	'img/fake-news.png',
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

export function hydrate() {
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
