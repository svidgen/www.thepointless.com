import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'The Red Dot',
		content: html`<div>
			<script>
				var lines = [
					"This is my red dot. It doesn't do anything if you click on it.",
					"Really, you can click on my red dot all you want. It won't do a thing.",
					"See what I mean? It didn't do anything did it? Try again.",
					"In doing nothing, my red dot is a great success. It'll <b>never</b> do a thing. Don't you believe me?",
					"You seem to want to think this red dot is here to entertain you.",
					"It's not.",
					"Alright dot-clicker, you keep trying.",
					"Fine.",
					"Maybe you're clicking too quickly. Try slower.",
					"Maybe if you tried clicking it faster?",
					"Look at yourself &mdash; sitting at a computer clicking on a damn dot, knowing very well it won't do anything for you.",
					"You realize that clicking on this dot will accomplish nothing, right?",
					"Wow. You're still clicking.",
					"Thank-you for clicking my red dot.",
					"Sorry, I can't reward you by making the dot do something.",
					"I already told you it wouldn't do anything."
				];
				var clicks = 0;
				function dotClick() {
					clicks++;
					var line = clicks % lines.length;
					document.mainForm.clicks.value = clicks;
					document.getElementById('message').innerHTML = lines[line];
				}
			</script>

			<p>Long ago, in the early days of the internet, there was a red dot. When you clicked on it, it would do neat things.</p>
			<p style='text-align: center;'><b>This is not that dot.</b></p>
			<p style='text-align: center;'>
				<img src='/static/images/reddot.jpg' alt='The red dot' onClick='dotClick();' style='cursor: pointer;' />
			</p>
			<div id='message' style='text-align: center; margin: 1em; font-size: 1.5em;'>This is my red dot. It doesn't do anything when you click on it.</div>
			<form class='dot-form' name='mainForm' method='get' action='/dotresults.html'>
				<input type='hidden' name='clicks' value='0' />
				<input type='hidden' name='dot' value='red' />
				<button type='submit' class='dot-done-button'>I'm done harassing the dot.</button>
			</form>
		</div>`
	});
}
