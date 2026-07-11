import { html, hydrate } from 'wirejs-dom/v2';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

const PREGGER_SHARE = {
	id: 'preggertest-share',
	header: 'Share this screening opportunity.',
	title: 'Online Pregnancy Test',
	text: 'A fully online pregnancy screening opportunity is available for your consideration.',
	url: '/preggertest.html'
};

export async function generate() {
	return Main({
		title: 'Online Pregnancy Test',
		content: html`<div>
			<style>
				.testcontainer { margin: 1.5rem auto; padding: 2rem; border: 2px solid #d0d5ff; max-width: 450px; max-height: 52px; }
				.testcontainer img { width: 100%; height: 100%; }
				.modal { position: fixed; display: table-cell; text-align: center; vertical-align: middle; overflow: hidden; top: 0; left: 0; width: 100%; height: 100%; margin: 0; padding: 3em 0 0 0; background-color: #fff; opacity: 0.8; filter: alpha(opacity=80); z-index: 1000; }
			</style>

			<div>Using the sensors in your keyboard, we are now able to remotely triangulate your hormone levels and detect the faint, early indicators of pregnancy.</div>
			<div class='testcontainer'><img src='/static/images/preggertest.png' alt='pregnancy test' style='border: 0; margin: 0;' /></div>
			<div>It's easy:
				<ol>
					<li>Just <b>urinate</b> on your keyboard or mobile device. <a href='#footnote_1' data-footnote-highlight>*</a></li>
					<li>Wait <b>2 minutes</b>.</li>
					<li>Click the <b>Am I Preggerz?</b> button.</li>
					<li><i>Disregard all results reported after 5 minutes!</i></li>
				</ol>
			</div>
			<div style='text-align: center;'><button type='button' class='button-pregnancy' data-pregger-test>🍼 Am I Preggerz?</button></div>
			${ShareWidget(PREGGER_SHARE)}
			<div id='footnote_1' style='color: gray; font-size: small;'><b>*</b> If it is physically difficult for you to urinate on your keyboard or mobile device, you may also submerge it in a urine-filled toilet.</div>
		</div>`
	});
}

export function onload() {
	hydrate('preggertest-share', () => ShareWidget(PREGGER_SHARE));

	let thinkDiv: HTMLDivElement | null = null;
	const clearResult = () => {
		if (!thinkDiv) return;
		document.body.style.overflow = 'scroll';
		thinkDiv.remove();
		thinkDiv = null;
	};

	document.querySelector('[data-pregger-test]')?.addEventListener('click', () => {
		if (thinkDiv) return;
		thinkDiv = document.createElement('div');
		thinkDiv.innerHTML = "Just a sec ...<br /><br /><img src='/static/images/please_wait.gif' />";
		thinkDiv.style.fontSize = '3rem';
		thinkDiv.className = 'modal';
		document.body.appendChild(thinkDiv);
		setTimeout(() => {
			if (!thinkDiv) return;
			thinkDiv.innerHTML = "No urine detected!<br /><br />Please <a href='#'>try again</a>.";
			thinkDiv.querySelector('a')?.addEventListener('click', event => {
				event.preventDefault();
				clearResult();
			});
		}, 4000);
	});

	const footnote = document.getElementById('footnote_1');
	document.querySelector('[data-footnote-highlight]')?.addEventListener('mouseenter', () => {
		if (footnote) footnote.style.color = '#cc0000';
	});
	document.querySelector('[data-footnote-highlight]')?.addEventListener('mouseleave', () => {
		if (footnote) footnote.style.color = 'gray';
	});
}
