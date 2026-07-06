import { html } from 'wirejs-dom/v2';
import { Main } from '../../layouts';

export async function generate() {
	return Main({
		title: 'Words and Word-like Things',
		content: html`<div>
			<p>... will be returning <s>soon</s> eventually.</p>
		</div>`
	});
}
