import { html } from 'wirejs-dom/v2';
import { FeatureLink, type FeatureLinkProps } from '../../components/feature-link';
import { Main } from '../../layouts';

type AppListing = Omit<FeatureLinkProps, 'className'>;

const games: AppListing[] = [
	{
		href: '/apps/shooty-ship/index.html',
		icon: '/static/apps/shooty-ship/img/icon.png',
		title: 'Shooty Ship (Original)',
		target: '_blank',
		description: 'Pew pew pew! Need I say more?',
	},
	{
		href: '/apps/shooty-ship-pumpkin-smash/index.html',
		icon: '/static/apps/shooty-ship-pumpkin-smash/img/icon.png',
		title: 'Shooty Ship - Pumpkin Smash',
		target: '_blank',
		description: 'Pew pew pew! But with pumpkins and stuff!',
	},
	{
		href: '/apps/shooty-ship-presidential/index.html',
		icon: '/static/apps/shooty-ship-presidential/img/icon.png',
		title: 'Shooty Ship - Presidential',
		target: '_blank',
		description: 'A very serious presidential-grade pew pew experience.',
	},
];

const clickyThings: AppListing[] = [
	{
		href: '/reddot.html',
		icon: '/static/images/reddot.jpg',
		title: html`<span>The <em>Infamous</em> Red Dot</span>`,
		ariaLabel: 'The Infamous Red Dot',
		description: html`<span>Infamous, I said. <strong><em>Infamous.</em></strong></span>`,
	},
	{
		href: '/greendot.html',
		icon: '/static/images/greendot.jpg',
		title: html`<span>The <em>somewhat less famous</em> Green Dot</span>`,
		ariaLabel: 'The somewhat less famous Green Dot',
		description: "Don't even bother. Seriously.",
	},
	{
		href: '/zebra-awareness.html',
		icon: '/static/images/zebratest/zebra.png',
		title: 'Zebra Awareness',
		description: 'Because, who else brings black and white together like a zebra?',
	},
	{
		href: '/preggertest.html',
		icon: '/static/images/preggertest.png',
		title: 'Online Pregnancy Testing',
		description: "Don't get caught unawares, ladies! (And now gentlemen, I guess.)",
	},
	{
		href: '/clickometer.html',
		icon: '/static/images/75px_cracked_mouse.png',
		title: 'The Clickometer',
		description: html`<span>Test your clicking <strong>prowess</strong>.</span>`,
	},
	{
		href: '/hs/frentagonist/index.html',
		icon: '/static/images/frentagonist-icon.png',
		title: 'Frentagonist Profile',
		description: html`<span>Generate a <code>frentagonist profile</code> to help people decide whether to be your <strong>friend</strong> or <strong>archrival</strong>.</span>`,
	},
];

function AppFeatureLink(listing: AppListing) {
	return FeatureLink({ ...listing, className: 'app-feature' });
}

export async function generate() {
	return Main({
		title: 'Apps & Games',
		content: html`<div>
			<h2>Games</h2>
			<div class='feature-link-list app-feature-list'>
				${games.map(AppFeatureLink)}
			</div>

			<h3>And Other Clicky Things</h3>
			<div class='feature-link-list app-feature-list'>
				${clickyThings.map(AppFeatureLink)}
			</div>
		</div>`
	});
}
