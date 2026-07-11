import { html, hydrate } from 'wirejs-dom/v2';
import { PointlessCertificate } from '../components/pointless-certificate';
import { ShareWidget } from '../components/share-widget';
import { Main } from '../layouts';

const CLICK_SHARE = {
	id: 'clickometer-result-share',
	header: 'Share your result.',
	url: '/clickometer.html',
	title: 'Click Power!',
	text: 'I have click power! BEAT THAT.'
};

export async function generate() {
	return Main({
		title: 'Click Power!',
		content: html`<div>
			${PointlessCertificate({
				kicker: 'The Bureau of Button-Pressing Distinction cordially certifies that',
				recipient: 'our prestigious unidentified guest',
				recipientLabel: 'has submitted to clickometric analysis and demonstrated',
				title: html`<span id='click-result'>pending</span>`,
				media: html`<img id='clickometer-mouse' src='/static/images/75px_crude_mouse.png' alt='mouse' title='clickometer awesomeness' />`,
				quote: html`<span id='click-quote'>An outcome of measurable clicking significance.</span>`,
				finePrint: html`<span id='click-description'>This result is suitable for polite conversation, private reflection, and other proceedings of limited consequence.</span>`,
				unminted: true,
			})}
			${ShareWidget(CLICK_SHARE)}
			<div id='clickometer-action'><a href='/clickometer.html'>Try again</a></div>
		</div>`
	});
}

function colorFor(power: number) {
	const green = Math.round(((100 - power) / 100) * 255.0);
	const red = 255 - green;
	return `rgb(${red},${green},0)`;
}
function summary(power: number) {
	if (power < 35) return 'Your click power is a clear indication that you spend too much time online. Though this is not due to an internet addiction or any other geekly tendencies. You just spend considerable time looking for the mouse buttons -- a problem for most elderly people, and nothing to be ashamed of.';
	if (power < 50) return "You're definitely on the lower end of the click power spectrum. You can probably out-click most girl scouts, even if you can't sell as many cookies. And it's clear that you're not a geek or internet addict, unless you're just a really slow one ...";
	if (power < 65) return "Being on the lower end of normal click power isn't bad, I guess. Chances are you're a pretty normal person. You're familiar with the internet, but not to the extent that you're a threat to 1337 h4x0rz. Which is good, because you wouldn't know what to do if you were h4x3d.";
	if (power < 80) return "You're on the upper end of normal click power. You spend a little too much time online, and you're beginning to lose touch with reality. So, you should occasionally spend some time away from anything you can click on, such as dots, worlds of warcraft, and clickometers.";
	if (power < 100) return "You're a geek. Fueling yourself with red bull for 36 to 72 hours of coding after 3 hours of sleep results in the bodily oscillation necessary for this kind of click power. Though, coupled with your social anxiety and endless hours of near-motionless MMORPGing, you're overdue for a heart attack or an aneurysm. Find something without mouse buttons to interact with for a few days.";
	return 'Seriously, you broke it. You broke the clickometer. It is clear the only way to to get an accurate read on your click power is with the s00p3r cLiCkOmEtEr.';
}
function sooperSummary(power: number) {
	if (power < 35) return "Well that's disappointing. After breaking the normal clickometer, you've barely registered on the s00p3r cLiCkOmEtEr. Your under-performance is overwhelming.";
	if (power < 50) return 'Not bad. But certainly not great. Have another red bull and try again.';
	if (power < 65) return 'The red bull is strong with this one ... Your performance here justifies your feat of strength on the standard clickometer. Though, you have much to learn before achieving the rank of Master.';
	if (power < 80) return "Alright, that's a little 1337. Cl34rly you.ve got a enough r3d bu11 in you 4 some pr1tt33 intense cl_1c|<1n6.";
	if (power < 90) return '0m3y3g0sh j00r f4c3 1z t3h s00p3r 1337z0rz!1//!?';
	return '01110011 00110000 00110000 01110000 00110011 01110010 00100000 00110001 00110011 00110011 00110111 00100000 01101000 00110100 01111000 00100001';
}

function hydrateClickometerResult() {
	const params = new URL(location.href).searchParams;
	const power = parseFloat(params.get('p') || '0');
	const level = Math.max(1, Math.min(2, parseInt(params.get('level') || '1')));
	const displayPower = Math.round(power * level);
	const color = colorFor(power);
	const broken = level === 1 && power >= 100;
	const sooperMice = ['/static/images/75px_lightning_mouse.png', '/static/images/75px_lined_mouse.png', '/static/images/75px_super_mouse.png'];
	const mouse = broken ? '/static/images/75px_cracked_mouse.png' : level === 2 ? sooperMice[displayPower % sooperMice.length] : '/static/images/75px_crude_mouse.png';
	(document.getElementById('clickometer-mouse') as HTMLImageElement).src = mouse;
	document.getElementById('click-result')!.innerHTML = broken ? `<span style="color:${color}">a broken clickometer</span>` : `<span style="color:${color}">${displayPower}</span> click power`;
	document.getElementById('click-quote')!.textContent = broken ? 'An achievement of considerable mechanical consequence.' : 'An outcome of measurable clicking significance.';
	document.getElementById('click-description')!.innerHTML = level === 2 ? sooperSummary(power) : summary(power);
	document.getElementById('clickometer-action')!.innerHTML = broken ? '<a href="/clickometer.html?level=2">Try the s00p3r cLiCkOmEtEr</a>' : '<a href="/clickometer.html">Try again</a>';
	document.title = broken ? 'You BROKE it - clickometer results' : `${displayPower} click power!`;

	const share = document.querySelector('[data-share-id="clickometer-result-share"]') as HTMLElement & { refreshSharePreview?: () => void } | null;
	if (share) {
		share.dataset.text = broken ? 'I have been formally recognized for breaking the clickometer.' : `I have been formally recognized for ${displayPower} click power.`;
		share.dataset.title = broken ? 'I broke the clickometer!' : `${displayPower} click power!`;
		share.dataset.url = `${location.origin}/clickometer.html`;
		share.refreshSharePreview?.();
	}
}

export function onload() {
	hydrate('clickometer-result-share', () => ShareWidget(CLICK_SHARE));
	hydrateClickometerResult();
}
