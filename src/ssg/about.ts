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
					<li>That it tediously overexplains obvious facts.</li>
					<li>That its facts are obviously and intentionally fallacious.</li>
					<li>That it &mdash; <i>and we <span data-tooltip='I.e., "paraphrase" and/or "completely fabricate".'>quote</span></i> &mdash; "should not exist for any reason but somehow does anyway."</li>
					<li>That it abuses tooltip text to negate its own observations and <span data-tooltip='One might be tempted to call these "points", but one would be wrong.'>statements</span>.</li>
					<li>Contains an alarming amount of tomfoolery and <i data-tooltip='🐄'>udder</i> puntification.</li>
					<li><i>Et cetera</i>, good sirs. <b>Et. <i>Cetera</i>.</b></li>
				</ul>

				<p>
					These claims are hurtful and churlish. They are also quite specific.
				</p>

				<p>
					Allegation have furthermore been levied against our target audience, suggesting that we seek to draw the internet wanderers of old, the forgotten goblins of yore, seeking to escape for a few moments and there amidst their busy days. These alleged Internet dinosaurs are said to be horrid time travelers of days long gone who seek this site for the purpose of &mdash; <b data-tooltip="A pronounced throat clear, obviously."><i>eh hem ... </i></b> &mdash; "wasting time."
				</p>

				<p>Our credentials say otherwise.</p>

				${PointlessAwardBadge()}

				<p>In conclusion, we are offended I think.</p>
			</div>
		`
	});
}
