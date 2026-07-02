import { html } from 'wirejs-dom/v2';

export function PointlessAwardBadge() {
	return html`<aside class='pointless-award-badge' aria-label='Pointless Award'>
		<a href='/awards/certificates/TPDC-PMWOT-0000000001'>
			<span class='award-star' aria-hidden='true'>★</span>
			<span>
				<span class='award-kicker'>Recipient of the</span>
				<strong>Pointless Award</strong>
				<span>for Excellence in Unnecessary Internet</span>
			</span>
		</a>
	</aside>`;
}
