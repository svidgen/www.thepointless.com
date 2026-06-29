import { html } from 'wirejs-dom/v2';
import { Main } from '../../layouts';

export async function generate() {
	return Main({
		title: 'Pointless Things',
		content: html`
			<h2>Pointless Things</h2>
			<p>A collection of small absurdist features, interactive bits, and short pleasures.</p>
			<ul>
				<li><a href='/words/'>Words (essays & shorts)</a></li>
				<li><a href='/apps/'>Apps & Games</a></li>
				<li><a href='/hs/'>Horoscopes & Signs</a></li>
				<li><a href='/features/falling-candy-corn'>Falling Candy Corn</a></li>
			</ul>
		`
	});
}
