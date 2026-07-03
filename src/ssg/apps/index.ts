import { html } from 'wirejs-dom/v2';
import { Main } from '../../layouts';

export async function generate() {
	return Main({
		title: 'Apps & Games',
		content: html`<div>
			<h2>Games</h2>
			<ul>
				<li><a href='/apps/shooty-ship/index.html'>Shooty Ship (Original)</a><br />Pew pew pew! Need I say more?</li>
				<li><a href='/apps/shooty-ship-pumpkin-smash/index.html'>Shooty Ship - Pumpkin Smash</a><br />Pew pew pew! But with pumpkins and stuff!</li>
				<li><a href='/apps/shooty-ship-presidential/index.html'>Shooty Ship - Presidential</a><br />A very serious presidential-grade pew pew experience.</li>
			</ul>

			<h3>And Other Clicky Things</h3>
			<ul>
				<li><a href='/reddot.html'>The <em>Infamous</em> Red Dot</a><br />Infamous, I said. <strong><em>Infamous.</em></strong></li>
				<li><a href='/greendot.html'>The <em>somewhat less famous</em> Green Dot</a><br />Don't even bother. Seriously.</li>
				<li><a href='/zebra-awareness.html'>Zebra Awareness</a><br />Because, who else brings black and white together like a zebra?</li>
				<li><a href='/preggertest.html'>Online Pregnancy Testing</a><br />Don't get caught unawares, ladies! (And now gentlemen, I guess.)</li>
				<li><a href='/clickometer.html'>The Clickometer</a><br />Test your clicking <strong>prowess</strong>.</li>
			</ul>
		</div>`
	});
}
