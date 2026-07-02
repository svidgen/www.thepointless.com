import { html } from 'wirejs-dom/v2';
import { Main } from '../../../layouts';

export async function generate() {
	return Main({
		title: 'Unclassified Words',
		content: html`<div>
			<h3>I used to only have three words.</h3>
			<ol>
				<li>giraffe</li>
				<li>zebra</li>
				<li>zeraffe</li>
			</ol>

			<h3>But now have these ones as well.</h3>
			<ul>
				<li>Big Dinosaur Problems as of Late<br />Synopsis: Dinosaurs are a problem. <em>(migration pending)</em></li>
				<li>dinosaur people<br />🦖🤷 <em>(migration pending)</em></li>
			</ul>

			<p><em>Yes</em>, there are more words out there. <em>I just have to find them.</em></p>

			<h3>Now, before I forget, here is one final word</h3>
			<ul>
				<li>Asparagus <em>(migration pending)</em></li>
			</ul>
		</div>`
	});
}
