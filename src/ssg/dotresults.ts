import { html, hydrate } from 'wirejs-dom/v2';
import { PointlessCertificate } from '../components/pointless-certificate';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

const DOT_SHARE = {
	id: 'dot-result-share',
	header: 'Share your experience.',
	title: 'For the Love of the Dot!',
	text: 'I have completed a formal dot-clicking experience.',
	url: '/reddot.html'
};

export async function generate() {
	return Main({
		title: 'For the Love of the Dot!',
		content: html`<div>
			${PointlessCertificate({
				kicker: 'The Office of Dot Appreciation cordially certifies that',
				recipient: 'our prestigious unidentified guest',
				recipientLabel: html`<span>has clicked the <span id='dot-result-color'>red</span> dot</span>`,
				title: html`<span id='dot-result-count'>0 times</span>`,
				quote: 'A gesture of impeccable purpose, acknowledged here with all due formality.',
				unminted: true,
			})}

			${ShareWidget(DOT_SHARE)}
		</div>`
	});
}

function hydrateDotResult() {
	const query = new URL(location.href).searchParams;
	const dot = query.get('dot') || 'red';
	const clicks = Number(query.get('clicks') || 0);
	const units = clicks === 1 ? 'time' : 'times';
	document.getElementById('dot-result-color')!.textContent = dot;
	document.getElementById('dot-result-count')!.textContent = `${clicks} ${units}`;
	const share = document.querySelector('[data-share-id="dot-result-share"]') as HTMLElement & { refreshSharePreview?: () => void } | null;
	if (share) {
		share.dataset.url = `${location.origin}/${dot}dot.html`;
		share.dataset.text = `I have been cordially certified for clicking the ${dot} dot ${clicks} ${units}.`;
		share.refreshSharePreview?.();
	}
}

export function onload() {
	hydrate('dot-result-share', () => ShareWidget(DOT_SHARE));
	hydrateDotResult();
}
