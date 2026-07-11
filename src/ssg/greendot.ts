import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'The Green Dot',
		content: html`<div>
			<script>
				var clicks = 0;
				function dotClick() {
					clicks++;
					document.mainForm.clicks.value = clicks;
				}
			</script>

			<p style='text-align: center;'>
				<img src='/static/images/greendot.jpg' alt='The green dot' onClick='dotClick();' style='cursor: pointer;' />
			</p>

			<div id='message' style='text-align: center; margin: 5px; font-size: 1.25rem;'>
				This is my green dot. It doesn't do anything when you click on it.
			</div>

			<form class='dot-form' name='mainForm' method='get' action='/dotresults.html'>
				<input type='hidden' name='clicks' value='0' />
				<input type='hidden' name='dot' value='green' />
				<button type='submit' class='dot-done-button'>I'm done harassing the dot.</button>
			</form>
		</div>`
	});
}
