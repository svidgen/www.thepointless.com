import { html, hydrate as wireHydrate } from 'wirejs-dom/v2';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

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
			<div class='img_overlay' style='width: 256px; margin: 20px auto;'>
				<img src='/static/images/zebratest/zebra.png' class='base' alt='zebra' />
				<img id='zebra-overlay' class='overlay' alt='' />
			</div>
			<h3 id='zebra-result' style='color: purple; text-align: center;'></h3>
			<div id='zebra-explanation' class='padded'></div>
			${ShareWidget({
				id: 'zebra-result-share',
				header: 'Help spread Zebra Awareness.',
				title: 'Zebra Awareness',
				text: 'Zebras are all around us and we do not even acknowledge them. Raise awareness, and GET TESTED.',
				url: '/zebra-awareness.html'
			})}
			<script src='/zebra-awareness-result.js'></script>
			<script>
				const red_x_url = '/static/images/zebratest/red_x.png';
				const checkmark_url = '/static/images/zebratest/green_check.png';
				const question_mark_url = '/static/images/zebratest/question_mark.png';
				let score = 0;
				const question_values = { q1: 2, q2: 2, q3: 2, q4: 2, q5: 1 };
				const url = new URL(location.href).searchParams;
				for (let k in question_values) score += (url.get(k) == '1' ? question_values[k] : 0);
				let result, overlay, explanation;
				if (score == 0) {
					result = 'You <u>are</u> a zebra.';
					overlay = checkmark_url;
					explanation = 'Your responses are unmistakable. Remember, being a zebra is nothing to be ashamed of. However, this does put you at a great disadvantage in a society littered with zebra discrimination. Remember to seek the support of your family and friends. More importantly, spread zebra awareness!';
				} else if (score == 1) {
					result = 'You <u>might</u> be a zebra.';
					overlay = question_mark_url;
					explanation = "The results are inconclusive! It would be best if you could <a href='/zebra-awareness-test.html'>retake the test</a> to ensure you answered all of the questions correctly. We can't have zebras walking around thinking they're people ...";
				} else {
					result = 'You are <u>not</u> a zebra.';
					overlay = red_x_url;
					explanation = 'This is great news! Free from the burdens and discriminations of zebrahood, you will find it easy to adhere to human activities such as shaking hands and driving cars. You can breath easy. But, spread the awareness: anyone you know could unwittingly be a zebra.';
				}
				document.getElementById('zebra-result').innerHTML = result;
				document.getElementById('zebra-overlay').src = overlay;
				document.getElementById('zebra-explanation').innerHTML = explanation;
				const share = document.querySelector('[data-share-id="zebra-result-share"]');
				if (share) {
					share.dataset.text = (score <= 1 ? 'Uh oh. I might be a zebra.' : 'Woot! I am not a zebra. (No offense to zebras!!!)') + ' Raise zebra awareness and get tested.';
					share.dataset.url = location.origin + '/zebra-awareness.html';
					if (window.tpdcInitShareWidget) window.tpdcInitShareWidget(share);
					if (share.refreshSharePreview) share.refreshSharePreview();
				}
			</script>
		</div>`
	});
}

export function hydrate() {
	wireHydrate('zebra-result-share', () => ShareWidget({
		id: 'zebra-result-share',
		header: 'Help spread Zebra Awareness.',
		title: 'Zebra Awareness',
		text: 'Zebras are all around us and we do not even acknowledge them. Raise awareness, and GET TESTED.',
		url: '/zebra-awareness.html'
	}));
}
