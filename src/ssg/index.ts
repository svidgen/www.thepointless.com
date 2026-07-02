import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { PointlessAwardBadge } from '../components/pointless-award';
import { Main } from '../layouts';

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

	return Main({
		content: html`<div>
			<p>In an internet of darkness there shines forth a <strong>light</strong>.</p>

			<p>Miscellaneous "bros" are trying to scam you out of your money with Web 3.0 and NFT crypto hax. But, here we are, just <strong>M</strong>aking <strong>W</strong>eb 1.0 <strong>G</strong>reat <strong>A</strong>gain. (<strong>MEGA</strong>)</p>

			<h2>I will step on any house I choose.</h2>

			<p style='text-align: center'>
				<img src='/static/images/big_giant.png' alt='Angry Stickman' style='border: 1px solid green; background-color: white' />
			</p>

			<p>We believe this is an acceptable compromise for greatness.</p>

			${PointlessAwardBadge()}

			<hr />

			<h2>The News</h2>
			<div class='news'>${newsItemsHtml}</div>
		</div>`
	});
}
