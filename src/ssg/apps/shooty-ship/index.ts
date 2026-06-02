import { html } from "wirejs-dom/v2";

export async function generate() {
	return html`<!doctype html>
		<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc">
			<head>
				<title>shooty ship - thepointless.com</title>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='theme-color' content='#422' />
				<link rel='manifest' href='manifest.json' crossorigin="use-credentials" />
				<link rel="shortcut icon" type="image/png" href="img/icon.png" />
				<link rel="apple-touch-icon" type="image/png" href="img/icon-180.png" />
			</head>
			<body id="thebody">
				<!-- Google tag (gtag.js) -->
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-G3MNNLJY8T"></script>
				<script>
					window.dataLayer = window.dataLayer || [];
					function gtag(){dataLayer.push(arguments);}
					gtag('js', new Date());
					gtag('config', 'G-G3MNNLJY8T');
				</script>

				<div id='notifications' class='notifications'></div>
				<div id="content">
					<div><ss:game
						name="Shooty Ship"
						enemies="shooty-ship-rock-150x150"
						shrapnel=""
						path="/apps/shooty-ship"
					></ss:game></div>
					<script type='text/javascript' src='js/game.js'></script>
					<script type='text/javascript'>
					if ('serviceWorker' in navigator) {
						navigator.serviceWorker.register('sw.js');
					};
					</script>
					<!-- Adsense -->
					<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
				</div>
			</body>
		</html>
	`;
}
