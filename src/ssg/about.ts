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
					<li>That its facts are obviously and tediously incorrect.</li>
					<li>That it emits an alarming amount of “this should not exist but does anyway” energy.</li>
					<li>That it abuses tooltip text to negate its own observations and <span data-tooltip='One might be tempted to call these "points", but one would be wrong.'>statements</span>.</li>
					<li>An alarming amount of tomfoolery and <i data-tooltip='🐄'>udder</i> such puns.</li>
					<li><i>Et cetera</i>, good sirs. <b>Et. <i>Cetera</i>.</b></li>
				</ul>

				<p>
					These claims are hurtful. And worse, they are specific.
				</p>

				<p>
					It has further been alleged that our visitors consist of nostalgic internet wanderers, aged goblins of the old web, time wasters, and probably <i data-tooltip='Persons of the worst variety, to be sure.'>teenagers</i>.
				</p>

				${PointlessAwardBadge()}

				<p>In conclusion, we are offended I think.</p>
			</div>
		`
	});
}
