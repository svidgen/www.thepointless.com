import { html, hydrate } from 'wirejs-dom/v2';
import { PointlessCertificate } from '../components/pointless-certificate';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

const ZEBRA_SHARE = {
	id: 'zebra-result-share',
	header: 'Share your assessment.',
	title: 'Zebra Awareness',
	text: 'Zebras are all around us and we do not even acknowledge them. Raise awareness, and GET TESTED.',
	url: '/zebra-awareness.html'
};

export async function generate() {
	return Main({
		title: 'Zebra Test Results',
		content: html`<div>
			<style>
				.img_overlay { position: relative; padding: 0; }
				.img_overlay .base { width: 100%; margin: 0; }
				.img_overlay .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; margin: 0; opacity: 0.7; }
				.padded { padding: 10px 20px; }
			</style>
			${PointlessCertificate({
				kicker: 'The Department of Striped Possibilities cordially certifies that',
				recipient: 'our prestigious unidentified guest',
				recipientLabel: 'has completed the Zebra Awareness assessment and is hereby classified as',
				title: html`<span id='zebra-result'>Pending review</span>`,
				media: html`<div class='img_overlay' style='width: 180px;'>
					<img src='/static/images/zebratest/zebra.png' class='base' alt='zebra' />
					<img id='zebra-overlay' class='overlay' alt='' />
				</div>`,
				quote: 'Please accept this finding with dignity, composure, and appropriate regard for nearby zebras.',
				finePrint: html`<span id='zebra-explanation'></span>`,
				unminted: true,
			})}
			${ShareWidget(ZEBRA_SHARE)}
		</div>`
	});
}

function hydrateZebraResult() {
	const overlays = {
		redX: '/static/images/zebratest/red_x.png',
		checkmark: '/static/images/zebratest/green_check.png',
		questionMark: '/static/images/zebratest/question_mark.png',
	};
	let score = 0;
	const questionValues = { q1: 2, q2: 2, q3: 2, q4: 2, q5: 1 };
	const url = new URL(location.href).searchParams;
	for (const k in questionValues) score += url.get(k) == '1' ? questionValues[k as keyof typeof questionValues] : 0;

	let result: string;
	let overlay: string;
	let explanation: string;
	if (score == 0) {
		result = 'a zebra';
		overlay = overlays.checkmark;
		explanation = 'Your responses are unmistakable. Remember, being a zebra is nothing to be ashamed of. However, this does put you at a great disadvantage in a society littered with zebra discrimination. Remember to seek the support of your family and friends. More importantly, spread zebra awareness!';
	} else if (score == 1) {
		result = 'possibly a zebra';
		overlay = overlays.questionMark;
		explanation = "The results are inconclusive! It would be best if you could <a href='/zebra-awareness-test.html'>retake the test</a> to ensure you answered all of the questions correctly. We can't have zebras walking around thinking they're people ...";
	} else {
		result = 'not a zebra';
		overlay = overlays.redX;
		explanation = 'This is great news! Free from the burdens and discriminations of zebrahood, you will find it easy to adhere to human activities such as shaking hands and driving cars. You can breath easy. But, spread the awareness: anyone you know could unwittingly be a zebra.';
	}
	document.getElementById('zebra-result')!.textContent = result;
	(document.getElementById('zebra-overlay') as HTMLImageElement).src = overlay;
	document.getElementById('zebra-explanation')!.innerHTML = explanation;
	const share = document.querySelector('[data-share-id="zebra-result-share"]') as HTMLElement & { refreshSharePreview?: () => void } | null;
	if (share) {
		share.dataset.text = 'I have completed a formal Zebra Awareness assessment.';
		share.dataset.url = `${location.origin}/zebra-awareness.html`;
		share.refreshSharePreview?.();
	}
}

export function onload() {
	hydrate('zebra-result-share', () => ShareWidget(ZEBRA_SHARE));
	hydrateZebraResult();
}
