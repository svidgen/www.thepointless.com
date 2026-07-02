import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'For the Love of the Dot!',
		content: html`<div>
			<div class='result-card dot-result-card'>
				<h2>Ok then.</h2>
				<p id='dot-result' class='dot-result'>You clicked the dot.</p>
				<div style='text-align: center;'>
					<p>That's not exactly something to be proud of. <i>But, hey.</i><br /><br />You did it.<br /><br /><b>You made it happen.</b></p>
					<p style='font-size: xx-large;'>🤔</p>
					<p style='color: #080; font-size: large;'><i>Let's see if <b>your friends</b> will do it too.</i></p>
					<p style='font-size: xx-large;'>😁</p>
				</div>
			</div>

			<div>
				<h2>Well</h2>
				<p>We have other things to do too, you know. It's not all just <b>red dots</b> and <b>tom foolery</b>.</p>
				<p>For instance. <b>You might be pregnant.</b> And as it happens we've developed a foolproof online test for <i>precisely that.</i> <em>(migration pending)</em></p>
				<p>On second thought. There may be more tom foolery than I had originally considered. But, the pregnancy test is totally legit. For serious.</p>
			</div>

			<p style='text-align: center;'><b><i>Psssst!</i></b></p>
			<p>Did you know you can get a copy of <b style='font-size: 1.25em'><a href='https://www.amazon.com/red-dot-thepointless-dot-com-presents/dp/B08C96QQPD/'>The Red Dot</a> <span style='color: red'><b>~~ iN PriNT ~~</b></span> 😲 <i>!!!</i></b></p>

			<script>
				(function () {
					var query = new URL(location.href).searchParams;
					var dot = query.get('dot') || 'red';
					var clicks = Number(query.get('clicks') || 0);
					var units = clicks === 1 ? 'time' : 'times';
					document.getElementById('dot-result').textContent = 'You clicked the ' + dot + ' dot ' + clicks + ' ' + units + '!';
				}());
			</script>
		</div>`
	});
}
