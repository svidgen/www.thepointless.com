import { html } from 'wirejs-dom/v2';
import { Main } from '../../../layouts';

export async function generate() {
	return Main({
		title: 'Frentagonist Test',
		description: 'Generate a frentagonist profile to determine whether someone is your friend or archrival.',
		content: html`<div>
			<link rel='stylesheet' href='/static/apps/frentagonist/index.css' />
			<h2>Are you friends or enemies?</h2>
			<p>
				Complete the profile. Share the generated link with another technically suspicious person.
				The machine will determine whether you are friends, enemies, or something worse: compatible.
			</p>
			<ft:app data-frentagonist-app></ft:app>
			<script src='/static/apps/frentagonist/index.js'></script>
		</div>`
	});
}
