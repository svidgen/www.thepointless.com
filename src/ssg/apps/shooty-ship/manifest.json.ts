import type { WebAppManifest } from "web-app-manifest";

export function generate(): WebAppManifest {
	return {
		id: 'com.thepointless.apps.shooty-ship',
		short_name: "Shooty Ship",
		name: "Shooty Ship",
		description: "Pew pew pew!",
		icons: [
			{
				src: "/apps/shooty-ship/img/shooty-ship-icon-512.png",
				type: "image/png",
				sizes: "512x512"	
			}
		],
		start_url: "index.html",
		scope: "/apps/shooty-ship/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#ffffff"
	};
}
