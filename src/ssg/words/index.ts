import { html } from 'wirejs-dom/v2';
import { Main } from '../../layouts';

export async function generate() {
	return Main({
		title: 'Words and Word-like Things',
		content: html`
			<div>
				<p>I have words for you. I crafted them with letters. I then combined them, in some cases, to form sentences, which in turn have occasionally been placed together to produce paragraphs.</p>

				<p>In the rarest of cases, I might even have aggregated paragraphs into a composition.</p>

				<h3>Choose Your Adventure</h3>
				<ul>
					<li><a href='/words/unclassified/index.html'>Unclassified Words</a></li>
					<li><a href='/words/serious/index.html'>In All Seriousness</a></li>
					<li><a href='/words/silly/index.html'>Silly Words</a></li>
				</ul>
			</div>
		`
	});
}
