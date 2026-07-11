import { html } from 'wirejs-dom/v2';
import { Main } from '../../../layouts';

export async function generate() {
	return Main({
		title: 'Serious Words',
		content: html`<div>
			<h2>404</h2>
			<p>Serious words <strong>Not Found.</strong></p>
		</div>`
	});
}
