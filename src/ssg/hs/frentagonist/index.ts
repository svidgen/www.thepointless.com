import { html, hydrate } from 'wirejs-dom/v2';
import { Main } from '../../../layouts';
import { FrentagonistApp } from '../../../lib/frentagonist/frentagonist-app';

export async function generate() {
	return Main({
		title: 'Frentagonist Test',
		description: 'Generate a frentagonist profile to determine whether someone is your friend or archrival.',
		content: html`<div>
			<link rel='stylesheet' href='index.css' />
			<h2>Are you friends or enemies?</h2>
			<p>
				Complete the profile. Share the generated link with another technically suspicious person.
				The machine will determine whether you are friends, enemies, or something worse: compatible.
			</p>
			<ft:app id='frentagonist-app' data-frentagonist-app></ft:app>
			<script src='index.js'></script>
		</div>`
	});
}

export function onload() {
	hydrate('frentagonist-app', () => FrentagonistApp());
}
