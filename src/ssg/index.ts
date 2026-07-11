import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { PointlessAwardBadge } from '../components/pointless-award';
import { Main } from '../layouts';
import { MailingListSignup } from '../components/mailing-list-signup';

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
		title: 'Welcome to the World Wide Web. 🌎',
		content: html`<div>
			<blockquote><i>There was a dream once that was the Internet. You could only <span data-tooltip='Because you were a nerd.'>whisper</span> it. Anything more than a single tab and it would crash, it was so fragile.</i> &mdash; Marcus Aurelius Probably</blockquote>
			
			<p>As the web around us falls into a state of <span data-tooltip='🐄'>udder</span> depravity, we stand athwart the various bros yelling, <i>"Refresh! Refresh! Refresh!"</i>. We <span data-tooltip='(While sitting.)'>stand</span> <span data-tooltip='with many people'>alone</span>, a stronghold of the old way &mdash; the way of the <i>wild</i> World Wide Web. The web of animated <span data-tooltip='Pronounced jiffs.'>GIFs</span>. Probably some unwanted audio. <b>Boldness</b>. Even some <i>italics</i> and <span class='blink'>blinking text</span>.</p>
			
			<p>And yes...</p>
			
			<marquee>Even marquees of great import.</marquee>
			
			<p>Above all, we will be perpetually "🏗️ Under Construction 🏗️". Our SLA will consist of <b data-tooltip='Distinctly better than one half of one nines, I must say!'>one whole nines</b> of availability. And, at times, our JavaScript might actually become so <s>unnecessarily large</s> <i>awesome and sophisticated</i> that your whole browser may simply <b>stop</b> to <i>admire</i> it.</p>

			<p>Our credentials are as follows.</p>

			${PointlessAwardBadge()}

			<p>And you would be wise to keep in touch.</p>

			${MailingListSignup()}
		</div>`
	});
}
