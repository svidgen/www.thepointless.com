${meta({
	layout: "bare"
})}
<!doctype html>
<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc">
<head>
	<title>shooty ship - thepointless.com</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
	<meta name='viewport' content='width=device-width, initial-scale=1' />
	<meta name='og:type' content='website' />
	<meta name='og:title' content='Shooty Ship' />
	<meta name='og:description' content='Pew pew pew! Shooty as many asteroid .. paper ball ... things? ... or whatever they are as you can! Pew pew pew!' />
	<meta name='og:image' content='img/icon.png' />
	<meta name='og:url' content='https://www.thepointless.com/apps/shooty-ship/index.html' />
	<link rel='manifest' href='manifest.json' crossorigin="use-credentials" />
	<link rel="icon" type="image/png" href="img/icon.png" />

</head>
<body id="thebody">

<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-920576-1"></script>
<script>
	window.dataLayer = window.dataLayer || [];
	function gtag(){dataLayer.push(arguments);}
	gtag('js', new Date());
	gtag('config', 'UA-920576-1');
</script>

<div id='notifications' class='notifications'></div>

<div id="content">

<div><ss:game
	name="Shooty Ship"
	enemies="shooty-ship-rock-150x150"
	shrapnel=""
></ss:game></div>

<script type='text/javascript' src='js/game.js'></script>
<script type='text/javascript'>
if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js?v=${BUILD_ID}');
};
</script>

<!-- Adsense -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>


</div>

</body>
</html>