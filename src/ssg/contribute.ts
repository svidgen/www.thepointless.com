import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Contribute',
		content: html`
			<div>
				<p>Help make a difference, friend. <a href='https://github.com/svidgen/www.thepointless.com'>Contribute</a> your code, your content, and your cookies. Come write the most professional looking code and content of the all the interwebs.</p>

				<p>For example:</p>

				<pre><code>const content = write({
	seed: Math.random(),
	style: CONTENT_STYLES.BEST,
	hasPoint: false
});</code></pre>

				<p><em>Beep. Boop. Bop.</em></p>

				<p>More computer noises.</p>
			</div>
		`
	});
}
