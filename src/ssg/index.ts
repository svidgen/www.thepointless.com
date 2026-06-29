import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';

export async function generate(context?: Context) {
	const m = await import('../news.cjs');
	const news = (m && (m.default || m)) || [];

	const newsItemsHtml = news.map(n => `
		<div class='news-item'>
			<h3><a href="${n.link}">${n.title}</a></h3>
			<div class='meta'>${n.pubDate}</div>
			<p>${(n.description || n.body).replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
		</div>
	`).join('\n');

	return html`<!doctype html>
	<html id='root'>
		<head>
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<title>thepointless.com</title>
			<link rel='icon' type='image/svg+xml' href='/static/images/favicon.ico' />
			<link rel='stylesheet' type='text/css' href='/static/default.css' />
		</head>
		<body>
			<div class='main'>
				<header>
					<img class='logo' src='/static/images/big_giant.png' />
					<div>
						<h1><a href='/'>thepointless.com</a></h1>
						<div class='tagline'>In an internet of darkness, there shines forth a light.</div>
						<div class='nav'>
							<a href='/'>Home</a>
							| <a href='/about.html'>About</a>
							| <a href='/features/index.html'>Pointless Things</a>
							| <a href='/apps/index.html'>Apps &amp; Games</a>
							| <a href='/books.html'>Books</a>
							| <a href='/words/index.html'>Words</a>
							| <a href='/hs/index.html'>Horoscopes</a>
							| <a href='/careers.html'>Careers</a>
							| <a href='/terms.html'>Terms</a>
							| <a href='/feed.rss' target='_blank' title='RSS feed'>RSS</a>
						</div>
					</div>
				</header>

				<main id='content'>
					<p>In an internet of darkness there shines forth a <strong>light</strong>.</p>

					<p>Miscellaneous "bros" are trying to scam you out of your money with Web 3.0 and NFT crypto hax. But, here we are, just <strong>M</strong>aking <strong>W</strong>eb 1.0 <strong>G</strong>reat <strong>A</strong>gain. (<strong>MEGA</strong>)</p>

					<h2>I will step on any house I choose.</h2>

					<p style='text-align: center'>
						<img src='/static/images/big_giant.png' alt='Angry Stickman' style='border: 1px solid green; background-color: white' />
					</p>

					<p>We believe this is an acceptable compromise for greatness.</p>

					<hr />

					<h2>The News</h2>
					<div class='news'>${newsItemsHtml}</div>
				</main>

				<footer>
					<p>© ${new Date().getFullYear()} thepointless.com</p>
				</footer>
			</div>
		</body>
	</html>`;
}
