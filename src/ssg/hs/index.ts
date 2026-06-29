import { html } from 'wirejs-dom/v2';
import { Main } from '../../layouts';

export async function generate() {
	return Main({
		title: 'Horoscopes & Signs',
		content: html`
			<h2>Horoscopes & Signs</h2>
			<p>Absurdist horoscopes, personality quizzes, and other mystical nonsense.</p>
			<ul>
				<li><a href='/hs/frentagonist/'>Frentagonist tools</a></li>
				<li><a href='/hs/'>All horoscopes</a></li>
			</ul>
		`
	});
}
