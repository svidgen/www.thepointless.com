import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Zebra Awareness Test',
		content: html`<div>
			<style>.modal { position: fixed; text-align: center; overflow: hidden; top: 0; left: 0; width: 100%; height: 100%; margin: 0; padding: 3em 0 0 0; background-color: #fff; opacity: 0.8; z-index: 1000; }</style>
			<form id='zebratest' name='zebratest' action='/zebra-awareness-result.html' method='get'>
				<img src='/static/images/zebratest/zebra.png' alt='zebra' style='float: right; margin-right: 20px; margin-left: 30px;' />
				Answer the following questions to the best of your ability.
				<ol class='spaced'>
					<li><div><b>Do you walk on all fours?</b></div><label><input type='radio' name='q1' value='1' /> Yes</label> <label><input type='radio' name='q1' value='0' /> No</label></li>
					<li><div><b>Do you have black and white stripes?</b></div><label><input type='radio' name='q2' value='1' /> Yes</label> <label><input type='radio' name='q2' value='0' /> No</label></li>
					<li><div><b>Do you have hooves?</b></div><label><input type='radio' name='q3' value='1' /> Yes</label> <label><input type='radio' name='q3' value='0' /> No</label></li>
					<li><div><b>Do you ever think to yourself, <i>Hey, I might be a zebra</i>?</b></div><label><input type='radio' name='q4' value='1' /> Yes</label> <label><input type='radio' name='q4' value='0' /> No</label></li>
					<li><div><b>Are you a zebra?</b></div><label><input type='radio' name='q5' value='1' /> Yes</label> <label><input type='radio' name='q5' value='0' /> No</label></li>
				</ol>
				<div style='margin: 10px 35px;'><input type='submit' value='Check Your Results' /></div>
			</form>
		</div>`
	});
}

export function onload() {
	document.getElementById('zebratest')?.addEventListener('submit', event => {
		const form = event.currentTarget as HTMLFormElement;
		event.preventDefault();
		const thinkDiv = document.createElement('div');
		thinkDiv.innerHTML = "Calculating ...<br /><br /><img src='/static/images/please_wait.gif' />";
		thinkDiv.style.fontSize = '3rem';
		thinkDiv.className = 'modal';
		document.body.appendChild(thinkDiv);
		setTimeout(() => form.submit(), 4000);
	});
}
