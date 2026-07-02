import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { PointlessAwardBadge } from '../components/pointless-award';
import { Main } from '../layouts';

export async function generate(context?: Context) {
	return Main({
		title: 'About',
		content: html`
			<div>
				<p>
					We have been asked, from time to time, what thepointless.com is <em>about</em>.
					This question is presumptuous, inflammatory, and frankly beneath the dignity of a serious dot-com.
				</p>

				<p>
					Nevertheless, certain allegations have been made. We deny them in the strongest possible terms.
				</p>

				<h3>Allegations currently under denial</h3>
				<ul>
					<li>That this dot-com contains absurd premises.</li>
					<li>That it conducts itself with fake seriousness.</li>
					<li>That it maintains dots that do nothing.</li>
					<li>That it overexplains obviously stupid things.</li>
					<li>That it gives off a troubling “this should not exist, but it does” energy.</li>
					<li>That it encourages low-stakes interaction.</li>
					<li>That it preserves personal-site weirdness in a time of great template conformity.</li>
				</ul>

				<p>
					These claims are hurtful. Worse, they are specific.
				</p>

				<p>
					It has further been alleged that our visitors are nostalgic internet wanderers, grown-up goblins of the old web,
					and other technically suspicious persons who enjoy harmless wastes of time.
					We cannot comment on an ongoing vibe investigation.
				</p>

				${PointlessAwardBadge()}

				<p>
					In conclusion, we are offended by the premise.
				</p>
			</div>
		`
	});
}
