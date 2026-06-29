import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Books',
		content: html`
			<h3>Our Books</h3>

			<p>Not strictly relevant to our mission. But, made by <b>us.</b> So, you should buy them.</p>

			<tpdc:featurelink href='https://www.amazon.com/Really-Bad-Poetry-Sadmood-Poet/dp/B0B4C1JYNY' icon='/images/books/really-bad-poetry.jpg' title='Really Bad Poetry' target='_blank'>
				<div data-id='description'>
					For that special someone in your life.
					Deep, heartfelt and really bad. Guaranteed to move you.
					<p>By <a href="https://www.instagram.com/sadmood_poet/">Sadmood Poet</a>.</p>
				</div>
			</tpdc:featurelink>

			<tpdc:featurelink href='https://www.amazon.com/dp/B0B4NRLL4B/ref=cm_sw_em_r_mt_dp_831RXES9XHDR1V00J553' icon='/images/books/the-eeka.jpg' title='The Eeka' target='_blank'>
				<div data-id='description'>
					The Eeka crept in closets, it hid under the stairs.
					But when Julie looked for it, The Eeka wasn't there.
					<p>By <a href="https://www.leywire.com">Ley Wire</a> (words and concept art)
					and <a href="http://madminimalist.com/">Laura Wire</a> (pictures).</p>
				</div>
			</tpdc:featurelink>

			<!-- Additional book links omitted for brevity in SSG port. -->
		`
	});
}
