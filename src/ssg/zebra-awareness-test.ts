import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Zebra Awareness Test',
		content: html`<div>
			<style>.modal { position: fixed; text-align: center; overflow: hidden; top: 0; left: 0; width: 100%; height: 100%; margin: 0; padding: 3em 0 0 0; background-color: #fff; opacity: 0.8; z-index: 1000; }</style>
			<form id='zebratest' name='zebratest' action='/zebra-awareness-result.html' method='get' onsubmit='return doSubmit();'>
				<img src='/static/images/zebratest/zebra.png' alt='zebra' style='float: right; margin-right: 20px; margin-left: 30px;' />
				Answer the following questions to the best of your ability.
				<ol class='spaced'>
					<li><div><b>Do you walk on all fours?</b></div><input type='radio' name='q1' value='1' /> Yes <input type='radio' name='q1' value='0' /> No</li>
					<li><div><b>Do you have black and white stripes?</b></div><input type='radio' name='q2' value='1' /> Yes <input type='radio' name='q2' value='0' /> No</li>
					<li><div><b>Do you have hooves?</b></div><input type='radio' name='q3' value='1' /> Yes <input type='radio' name='q3' value='0' /> No</li>
					<li><div><b>Do you ever think to yourself, <i>Hey, I might be a zebra</i>?</b></div><input type='radio' name='q4' value='1' /> Yes <input type='radio' name='q4' value='0' /> No</li>
					<li><div><b>Are you a zebra?</b></div><input type='radio' name='q5' value='1' /> Yes <input type='radio' name='q5' value='0' /> No</li>
				</ol>
				<div style='margin: 10px 35px;'><input type='submit' value='Check Your Results' /></div>
			</form>
			<script>
				function doSubmit() {
					var think_div = document.createElement('div');
					think_div.innerHTML = "Calculating ...<br /><br /><img src='/static/images/please_wait.gif' />";
					think_div.style.fontSize = '3rem';
					think_div.className = 'modal';
					document.body.appendChild(think_div);
					setTimeout(function() { document.getElementById('zebratest').submit(); }, 4000);
					return false;
				}
			</script>
		</div>`
	});
}
