import { html } from 'wirejs-dom/v2';
import { MailingListSignup } from '../components/mailing-list-signup';
import { SocialShare } from '../components/social-share';
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
			${SocialShare({
				id: 'clickometer-result-share',
				header: 'You think your friends can beat you in all your glory? Huh!?? DO YA!?',
				url: '/clickometer.html',
				title: 'Click Power!',
				text: 'I have click power! BEAT THAT.'
			})}
			${MailingListSignup()}
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
					if (power < 100) return "You're a geek. Fueling yourself with red bull for 36 to 72 hours of coding after 3 hours of sleep results in the bodily oscillation necessary for this kind of click power. Though, coupled with your social anxiety and endless hours of near-motionless MMORPGing, you're overdue for a heart attack or an aneurysm. Find something without mouse buttons to interact with for a few days.";
					return 'Seriously, you broke it. You broke the clickometer. It is clear the only way to to get an accurate read on your click power is with the s00p3r cLiCkOmEtEr.';
				}
				function sooperSummary(power) {
					if (power < 35) return "Well that's disappointing. After breaking the normal clickometer, you've barely registered on the s00p3r cLiCkOmEtEr. Your under-performance is overwhelming.";
					if (power < 50) return 'Not bad. But certainly not great. Have another red bull and try again.';
					if (power < 65) return 'The red bull is strong with this one ... Your performance here justifies your feat of strength on the standard clickometer. Though, you have much to learn before achieving the rank of Master.';
					if (power < 80) return "Alright, that's a little 1337. Cl34rly you.ve got a enough r3d bu11 in you 4 some pr1tt33 intense cl_1c|<1n6.";
					if (power < 90) return '0m3y3g0sh j00r f4c3 1z t3h s00p3r 1337z0rz!1//!?';
					return '01110011 00110000 00110000 01110000 00110011 01110010 00100000 00110001 00110011 00110011 00110111 00100000 01101000 00110100 01111000 00100001';
				}
				const params = new URL(location.href).searchParams;
				const power = parseFloat(params.get('p') || '0');
				const level = Math.max(1, Math.min(2, parseInt(params.get('level') || '1')));
				const displayPower = Math.round(power * level);
				const color = colorFor(power);
				const broken = level === 1 && power >= 100;
				const sooperMice = ['/static/images/75px_lightning_mouse.png', '/static/images/75px_lined_mouse.png', '/static/images/75px_super_mouse.png'];
				const mouse = broken ? '/static/images/75px_cracked_mouse.png' : level === 2 ? sooperMice[displayPower % sooperMice.length] : '/static/images/75px_crude_mouse.png';
				document.getElementById('clickometer-mouse').src = mouse;
				document.getElementById('click-result').innerHTML = broken ? 'You <span style="color:' + color + '">broke</span> the clickometer!' : 'You have <span style="color:' + color + '">' + displayPower + '</span> click power!';
				document.getElementById('click-description').innerHTML = level === 2 ? sooperSummary(power) : summary(power);
				document.getElementById('clickometer-action').innerHTML = broken ? '<a href="/clickometer.html?level=2">Try the s00p3r cLiCkOmEtEr</a>' : '<a href="/clickometer.html">Try again</a>';
				document.title = broken ? 'You BROKE it - clickometer results' : displayPower + ' click power!';

				const share = document.querySelector('[data-share-id="clickometer-result-share"]');
				const shareText = broken ? 'I broke the clickometer! BEAT THAT.' : 'I have ' + displayPower + ' click power! BEAT THAT.';
				const shareTitle = broken ? 'I broke the clickometer!' : displayPower + ' click power!';
				const shareUrl = location.origin + '/clickometer.html';
				if (share) {
					share.dataset.text = shareText;
					share.dataset.title = shareTitle;
					share.dataset.url = shareUrl;
					const encodedText = encodeURIComponent(shareText);
					const encodedTitle = encodeURIComponent(shareTitle);
					const encodedUrl = encodeURIComponent(shareUrl);
					share.querySelector('[data-provider="facebook"]').href = 'https://www.facebook.com/sharer.php?u=' + encodedUrl + '&quote=' + encodedText;
					share.querySelector('[data-provider="twitter"]').href = 'https://twitter.com/share?url=' + encodedUrl + '&text=' + encodedText;
					share.querySelector('[data-provider="email"]').href = 'mailto:?subject=' + encodedTitle + '&body=' + encodedText + '%0A%0A' + encodedUrl;
					const nativeButton = share.querySelector('[data-provider="native"]');
					if (navigator.share) {
						nativeButton.onclick = function() { navigator.share({ title: shareTitle, text: shareText, url: shareUrl }); };
					} else {
						nativeButton.style.display = 'none';
					}
					share.querySelector('[data-provider="copy"]').onclick = function() {
						navigator.clipboard.writeText(shareText + '\\n\\n' + shareUrl);
						this.textContent = '✔️ Copied';
						setTimeout(() => this.textContent = '📋 Copy', 1000);
					};
				}
			</script>
		</div>`
	});
}
