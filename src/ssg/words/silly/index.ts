import { html } from 'wirejs-dom/v2';
import { Main } from '../../../layouts';

export async function generate() {
	return Main({
		title: 'Silly Words',
		content: html`<div>
			<p>Silly words are currently being rounded up and alphabetized.</p>
		</div>`
	});
}
