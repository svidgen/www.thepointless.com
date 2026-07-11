import type { WebAppManifest } from 'web-app-manifest';

export function generate(): WebAppManifest {
	return {
		id: 'com.thepointless.apps.shooty-ship-presidential',
		name: 'Shooty Ship - Presidential',
		short_name: 'Presidential',
		start_url: 'index.html',
		scope: '/apps/shooty-ship-presidential/',
		display: 'standalone',
		background_color: '#442222',
		theme_color: '#442222',
		icons: [{
			src: '/static/apps/shooty-ship-presidential/img/icon.png',
			sizes: '192x192',
			type: 'image/png',
		}],
	};
}
