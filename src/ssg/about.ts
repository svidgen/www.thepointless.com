import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { Main } from '../layouts';

export async function generate(context?: Context) {
	return Main({
		title: 'About',
		content: html`
			<div class='marketing-point'>
				<div>
					<img alt='factory' title='our dot-com. image stolen from http://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Factory_icon.svg/75px-Factory_icon.svg.png' src='/static/images/75px_Factory.png' />
				</div>
				<div>
					<b>thepointless.com is a serious dot-com.</b>
					We work in rooms inside buildings and type on keyboards &mdash; many of which are even attached to computers. Our building looks like a two-dimnensional, monocolor factory from very far away.
				</div>
			</div>

			<div class='marketing-point'>
				<div>
					<img alt='gears' title='the gears of productivity.' src='/static/images/49px_GreenCog.png' />
				</div>
				<div>
					<b>We work hard and with gears.</b>
					Lots and lots of gears. We type things on keyboards that make the computers turn the gears. Those gears turn other gears, which ultimately turn the most important gears. Lots of important gears.
				</div>
			</div>

			<div class='marketing-point'>
				<div>
					<img alt='people' title='professionals.' src='/static/images/75px_ThreeGrayPeople.png' />
				</div>
				<div>
					<b>Lean. Synergetic. Performant. Agile.</b>
					That's what our awesome people eventually do with all the gears. And then they do <b>Analytics</b> and <b>ROI</b> and <b>TLA</b>'s. And then more working with gears. And boy, do we ever.
				</div>
			</div>

			<div><tpdc:share header="Proclaim the good news."></tpdc:share></div>
		`
	});
}
