import { html, hydrate as wireHydrate } from 'wirejs-dom/v2';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Online Pregnancy Test',
		content: html`<div>
			<style>
				.testbutton { display: inline-block; cursor: pointer; border: 0.25rem solid #f5d0d0; background-color: #f0f5ff; margin: 2rem auto 4rem; padding: 0.75rem; text-align: center; font-weight: bold; }
				.testbutton:hover { background-color: white; }
				.testcontainer { margin: 1.5rem auto; padding: 2rem; border: 2px solid #d0d5ff; max-width: 450px; max-height: 52px; }
				.testcontainer img { width: 100%; height: 100%; }
				.modal { position: fixed; display: table-cell; text-align: center; vertical-align: middle; overflow: hidden; top: 0; left: 0; width: 100%; height: 100%; margin: 0; padding: 3em 0 0 0; background-color: #fff; opacity: 0.8; filter: alpha(opacity=80); z-index: 1000; }
			</style>
			<script>
				var think_div = false;
				function dotest() {
					if (think_div) return true;
					think_div = document.createElement('div');
					think_div.innerHTML = "Just a sec ...<br /><br /><img src='/static/images/please_wait.gif' />";
					think_div.style.fontSize = '3rem';
					think_div.className = 'modal';
					document.body.appendChild(think_div);
					setTimeout(function() {
						think_div.innerHTML = "No urine detected!<br /><br />Please <a href='javascript:clearresult();'>try again</a>.";
					}, 4000);
					return false;
				}
				function clearresult() {
					if (think_div) {
						document.body.style.overflow = 'scroll';
						think_div.parentNode.removeChild(think_div);
						think_div = false;
					}
				}
				function setColor(id, color) { var n = document.getElementById(id); if (n) n.style.color = color; }
			</script>

			<div>Using the sensors in your keyboard, we are now able to remotely triangulate your hormone levels and detect the faint, early indicators of pregnancy.</div>
			<div class='testcontainer'><img src='/static/images/preggertest.png' alt='pregnancy test' style='border: 0; margin: 0;' /></div>
			<div>It's easy:
				<ol>
					<li>Just <b>urinate</b> on your keyboard or mobile device. <a href='#footnote_1' style='cursor: pointer; font-weight: bold;' onmouseover="setColor('footnote_1', '#cc0000');" onmouseout="setColor('footnote_1', 'gray');">*</a></li>
					<li>Wait <b>2 minutes</b>.</li>
					<li>Click the <b>Am I Preggerz?</b> button.</li>
					<li><i>Disregard all results reported after 5 minutes!</i></li>
				</ol>
			</div>
			<div style='text-align: center;'><div class='testbutton' onclick='dotest();'>Am I Preggerz?</div></div>
			${ShareWidget({
				id: 'preggertest-share',
				header: 'Make sure everyone gets tested.',
				title: 'Online Pregnancy Test',
				text: "It's never too soon (or LATE) to know if you're preggerz. Get tested online TODAY.",
				url: '/preggertest.html'
			})}
			<script src='/preggertest.js'></script>
			<div id='footnote_1' style='color: gray; font-size: small;'><b>*</b> If it is physically difficult for you to urinate on your keyboard or mobile device, you may also submerge it in a urine-filled toilet.</div>
		</div>`
	});
}

export function hydrate() {
	wireHydrate('preggertest-share', () => ShareWidget({
		id: 'preggertest-share',
		header: 'Make sure everyone gets tested.',
		title: 'Online Pregnancy Test',
		text: "It's never too soon (or LATE) to know if you're preggerz. Get tested online TODAY.",
		url: '/preggertest.html'
	}));
}
