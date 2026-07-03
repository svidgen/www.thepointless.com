import { html } from 'wirejs-dom/v2';
import { FeatureLink } from '../components/feature-link';
import { Main } from '../layouts';

const books = [
	{
		title: 'Really Bad Poetry',
		href: 'https://www.amazon.com/Really-Bad-Poetry-Sadmood-Poet/dp/B0B4C1JYNY',
		icon: '/static/images/books/really-bad-poetry.jpg',
		description: html`<div>
			For that special someone in your life.
			Deep, heartfelt and really bad. Guaranteed to move you.
			<p>By <a href='https://www.instagram.com/sadmood_poet/'>Sadmood Poet</a>.</p>
		</div>`,
	},
	{
		title: 'The Eeka',
		href: 'https://www.amazon.com/dp/B0B4NRLL4B/ref=cm_sw_em_r_mt_dp_831RXES9XHDR1V00J553',
		icon: '/static/images/books/the-eeka.jpg',
		description: html`<div>
			The Eeka crept in closets, it hid under the stairs.
			But when Julie looked for it, The Eeka wasn't there.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words and concept art)
			and <a href='http://madminimalist.com/'>Laura Wire</a> (pictures).</p>
		</div>`,
	},
	{
		title: 'The Red Dot',
		href: 'https://www.amazon.com/red-dot-thepointless-dot-com-presents/dp/B08C96QQPD',
		icon: '/static/images/books/the-red-dot.jpg',
		description: html`<div>
			Based on a <a href='/reddot.html'>true story</a>.
			<p>By <a href='https://www.thepointless.com'>Jon Wire</a> (words and dot).</p>
		</div>`,
	},
	{
		title: 'Five Mountaineers',
		href: 'https://www.amazon.com/Five-Mountaineers-Ley-Wire/dp/B09MYSQGDY',
		icon: '/static/images/books/five-mountaineers.jpg',
		description: html`<div>
			Five Mountaineers is a delightfully silly trek up a mountain so high
			and a great introduction to ordinal numbers!
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words)
			and <a href='http://madminimalist.com/'>Laura Wire</a> (pictures).</p>
		</div>`,
	},
	{
		title: 'Baby G',
		href: 'https://www.amazon.com/Baby-G-Ley-Wire/dp/B09CGKTLG3',
		icon: '/static/images/books/baby-g.jpg',
		description: html`<div>
			Baby G is a stuffed giraffe who wants to do it all! Watch her
			as she climbs trees, helps cook food, plays with paints and goes
			on a bike ride! Lively lyrics make this book a must have for all ages.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words)
			and <a href='http://madminimalist.com/'>Laura Wire</a> (pictures).</p>
		</div>`,
	},
	{
		title: 'A Short Study of Marine Biology',
		href: 'https://www.amazon.com/Short-Study-Marine-Biology/dp/B08Z2NTWWR',
		icon: '/static/images/books/a-short-study-of-marine-biology.jpg',
		description: html`<div>
			A Short Study of Marine Biology combines science and poetry
			to engage explorers of all ages.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a></p>
		</div>`,
	},
	{
		title: 'Was It A Box?',
		href: 'https://www.amazon.com/Was-Box-Ley-Wire/dp/B08JZP6ZZQ',
		icon: '/static/images/books/was-it-a-box.jpg',
		description: html`<div>
			When is a box, more than a box? When it's in Ellie's hands!
			Ellie is a creative, energetic four year old who was gifted a box
			from Mom and Dad. But nothing is what it appears in Ellie's world.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words)
			and <a href='http://madminimalist.com/'>Laura Wire</a> (pictures).</p>
		</div>`,
	},
	{
		title: 'The Battle of Froggy Lake',
		href: 'https://www.amazon.com/Battle-Froggy-Lake-Ley-Wire/dp/B0884FQ7XF',
		icon: '/static/images/books/the-battle-of-froggy-lake.jpg',
		description: html`<div>
			Whimsical poetry and playful illustration, enjoy a summer day on Froggy Lake.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words)
			and <a href='https://www.amazon.com/s?i=stripbooks&rh=p_27%3AMichaela+Wire&s=relevancerank&text=Michaela+Wire&ref=dp_byline_sr_book_2'>Michaela Wire</a> (pictures).</p>
		</div>`,
	},
	{
		title: 'Desert Flowers',
		href: 'https://www.amazon.com/gp/product/B092M36D95',
		icon: '/static/images/books/desert-flowers.jpg',
		description: html`<div>
			Whimsical poetry and playful illustration, enjoy a summer day on Froggy Lake.
			<p>By <a href='https://www.leywire.com'>Ley Wire</a> (words)
			and <a href='https://www.amazon.com/s?i=stripbooks&rh=p_27%3AMichaela+Wire&s=relevancerank&text=Michaela+Wire&ref=dp_byline_sr_book_2'>Michaela Wire</a> (pictures).</p>
		</div>`,
	},
];

export async function generate() {
	return Main({
		title: 'Books',
		content: html`<div>
			<h3>Our Books</h3>

			<p>Not strictly relevant to our mission. But, made by <b>us.</b> So, you should buy them.</p>

			<div class='feature-link-list book-list'>
				${books.map(book => FeatureLink({ ...book, target: '_blank', className: 'book-feature' }))}
			</div>
		</div>`
	});
}
