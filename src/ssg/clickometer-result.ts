import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Click Power!',
		content: html`<div>
			<div class='result-card dot-result-card'>
				<h2>Your Click Analysis</h2>
				<div class='clickometer-scoreline'>
					<img id='clickometer-mouse' src='/static/images/75px_crude_mouse.png' alt='mouse' title='clickometer awesomeness' />
					<p id='click-result' class='dot-result'></p>
				</div>
				<div id='click-description'></div>
			</div>
			<div id='clickometer-action'><a href='/clickometer.html'>Try again</a></div>
			<script>
				function colorFor(power) {
					const green = Math.round(((100 - power) / 100) * 255.0);
					const red = 255 - green;
					return 'rgb(' + red + ',' + green + ',0)';
				}
				function summary(power) {
					if (power < 35) return 'Your click power is a clear indication that you spend too much time online. Though this is not due to an internet addiction or any other geekly tendencies. You just spend considerable time looking for the mouse buttons -- a problem for most elderly people, and nothing to be ashamed of.';
					if (power < 50) return "You're definitely on the lower end of the click power spectrum. You can probably out-click most girl scouts, even if you can't sell as many cookies. And it's clear that you're not a geek or internet addict, unless you're just a really slow one ...";
					if (power < 65) return "Being on the lower end of normal click power isn't bad, I guess. Chances are you're a pretty normal person. You're familiar with the internet, but not to the extent that you're a threat to 1337 h4x0rz. Which is good, because you wouldn't know what to do if you were h4x3d.";
					if (power < 80) return "You're on the upper end of normal click power. You spend a little too much time online, and you're beginning to lose touch with reality. So, you should occasionally spend some time away from anything you can click on, such as dots, worlds of warcraft, and clickometers.";
					if (power < 98) return "You're a geek. Fueling yourself with red bull for 36 to 72 hours of coding after 3 hours of sleep results in the bodily oscillation necessary for this kind of click power. Though, coupled with your social anxiety and endless hours of near-motionless MMORPGing, you're overdue for a heart attack or an aneurysm. Find something without mouse buttons to interact with for a few days.";
					return 'Seriously, you broke it. You broke the clickometer. It is clear the only way to to get an accurate read on your click power is with the s00p3r cLiCkOmEtEr. <i>(Coming again soon?)</i>';
				}
				const power = parseFloat(new URL(location.href).searchParams.get('p') || '0');
				const color = colorFor(power);
				const broken = power >= 90;
				document.getElementById('clickometer-mouse').src = broken ? '/static/images/75px_cracked_mouse.png' : '/static/images/75px_crude_mouse.png';
				document.getElementById('click-result').innerHTML = broken ? 'You <span style="color:' + color + '">broke</span> the clickometer!' : 'You have <span style="color:' + color + '">' + power + '</span> click power!';
				document.getElementById('click-description').innerHTML = summary(power);
				document.getElementById('clickometer-action').innerHTML = broken ? '<a href="/clickometer.html">Try the s00p3r cLiCkOmEtEr</a>' : '<a href="/clickometer.html">Try again</a>';
				document.title = broken ? 'You BROKE it - clickometer results' : power + ' click power!';
			</script>
		</div>`
	});
}
