import type { WebAppManifest } from 'web-app-manifest';

export function generate(): WebAppManifest {
	return {
		id: 'com.thepointless.apps.shooty-ship-pumpkin-smash',
		name: 'Shooty Ship - Pumpkin Smash',
		short_name: 'Pumpkin Smash',
		start_url: 'index.html',
		scope: '/apps/shooty-ship-pumpkin-smash/',
		display: 'standalone',
		background_color: '#442222',
		theme_color: '#442222',
		icons: [{
			src: '/static/apps/shooty-ship-pumpkin-smash/img/icon.png',
			sizes: '192x192',
			type: 'image/png',
		}],
	};
}
