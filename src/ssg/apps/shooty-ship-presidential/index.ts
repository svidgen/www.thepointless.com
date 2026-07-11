import { html } from 'wirejs-dom/v2';

export async function generate() {
	return html`<!doctype html>
		<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc">
			<head>
				<title>Shooty Ship - Presidential - thepointless.com</title>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='theme-color' content='#422' />
				<link rel='manifest' href='manifest.json' crossorigin='use-credentials' />
				<link rel='shortcut icon' type='image/png' href='/static/apps/shooty-ship-presidential/img/icon.png' />
				<link rel='apple-touch-icon' type='image/png' href='/static/apps/shooty-ship-presidential/img/icon.png' />
				<link rel='stylesheet' href='/static/apps/shooty-ship-presidential/css/sheet-old.css' />
				<link rel='stylesheet' href='/apps/shooty-ship/js/game.css' />
				<script>globalThis.SHOOTY_SHIP_ASSET_BASE = '/static/apps/shooty-ship-presidential/';</script>
			</head>
			<body id='thebody'>
				<div id='notifications' class='notifications'></div>
				<div id='content'>
					<div><ss:game
						name='Shooty Ship - Presidential'
						enemies='trump-1-tl,trump-2-tl,trump-3-tl,trump-4-tl,trump-5-tl,trump-6-tl'
						shrapnel='believe-me,big,definitely,fake-news,huge,maybe,probably,really,zero'
						path='/apps/shooty-ship-presidential'
					></ss:game></div>
					<script type='text/javascript' src='/apps/shooty-ship/js/game.js'></script>
					<script type='text/javascript'>
					if ('serviceWorker' in navigator) {
						navigator.serviceWorker.register('sw.js');
					}
					</script>
				</div>
			</body>
		</html>`;
}
