import { html, hydrate as wireHydrate } from 'wirejs-dom/v2';
import { PointlessCertificate } from '../components/pointless-certificate';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'For the Love of the Dot!',
		content: html`<div>
			${PointlessCertificate({
				kicker: 'The Office of Dot Appreciation cordially certifies that',
				recipient: 'You',
				recipientLabel: html`<span>have clicked the <span id='dot-result-color'>red</span> dot</span>`,
				title: html`<span id='dot-result-count'>0 times</span>`,
				quote: 'A gesture of impeccable purpose, acknowledged here with all due formality.',
				unminted: true,
			})}

			${ShareWidget({
				id: 'dot-result-share',
				header: 'Share your experience.',
				title: 'For the Love of the Dot!',
				text: 'I have completed a formal dot-clicking experience.',
				url: '/reddot.html'
			})}
			<script src='/dotresults.js'></script>

			<script>
				(function () {
					var query = new URL(location.href).searchParams;
					var dot = query.get('dot') || 'red';
					var clicks = Number(query.get('clicks') || 0);
					var units = clicks === 1 ? 'time' : 'times';
					document.getElementById('dot-result-color').textContent = dot;
					document.getElementById('dot-result-count').textContent = clicks + ' ' + units;
					var share = document.querySelector('[data-share-id="dot-result-share"]');
					if (share) {
						share.dataset.url = location.origin + '/' + dot + 'dot.html';
						share.dataset.text = 'I have been cordially certified for clicking the ' + dot + ' dot ' + clicks + ' ' + units + '.';
						if (window.tpdcInitShareWidget) window.tpdcInitShareWidget(share);
						if (share.refreshSharePreview) share.refreshSharePreview();
					}
				}());
			</script>
		</div>`
	});
}

export function hydrate() {
	wireHydrate('dot-result-share', () => ShareWidget({
		id: 'dot-result-share',
		header: 'Share your experience.',
		title: 'For the Love of the Dot!',
		text: 'I have completed a formal dot-clicking experience.',
		url: '/reddot.html'
	}));
}
