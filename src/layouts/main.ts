import { html, node, hydrate } from 'wirejs-dom/v2';
import type { AuthenticationState } from 'wirejs-resources';
import { PointlessAwardBadge } from '../components/pointless-award';

const TITLE = 'thepointless.com';
const SUBTITLE = 'A solitary bastion of sensibility in a web of nonsense.';
const MENU_ID = 'account-menu';
const DISCLAIMER = '';


export async function Main(slots: {
	/**
	 * Replaces the default prefix in the final page title.
	 */
	siteTitle?:
		| string
		| ((state: AuthenticationState) => string);

	/**
	 * Appears on the page under the site title.
	 * 
	 * Set to empty-string explicitly to omit the default.
	 */
	siteSubTitle?:
		| string
		| ((state: AuthenticationState) => string);

	/**
	 * The page title. Appears below the site title and subtitle when given.
	 */
	title?:
		| string
		| ((state: AuthenticationState) => string);

	/**
	 * The main content for the page.
	 */
	content:
		| HTMLElement
		| ((state: AuthenticationState) => HTMLElement);

	/**
	 * Text description to use in page metadata.
	 */
	description?:
		| string;

	/**
	 * Appears in the top of the footer.
	 */
	disclaimer?: 
		| string
		| HTMLElement
		| ((state: AuthenticationState) => string | HTMLElement);
}) {

	const pageTitle = slots.title ? html`
		<h2 style='font-variant: small-caps;'>
			${slots.title}
		</h2>
	` : '';

	const metaDescription = slots.description
		? `<meta
			name="description"
			content="${slots.description.replaceAll('"', '&quot;')}">`
		: '';

	const browserBarTitle = [
		slots.title,
		slots.siteTitle || TITLE,
		slots.siteSubTitle || SUBTITLE,
	].filter(Boolean).slice(0, 3).join(' - ');

	return html`
		<!doctype html>
		<html id='root'>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				${metaDescription}
				<title>${browserBarTitle}</title>
				<link rel='icon' type='image/svg+xml' href='/static/images/favicon.ico' />
				<link rel='stylesheet' type='text/css' href='/static/default.css' />
			</head>
			<body>
				<div class='main'>
					<header>
						<img class='logo' src='/static/images/big_giant.png' />
						<div>
							<h1><a href='/'>${slots.siteTitle || TITLE}</a></h1>
							<div class='tagline'>${slots.siteSubTitle ?? SUBTITLE}</div>
							<div class='nav'>
								<a href='/'>Home</a>
								| <a href='/apps/index.html'>Apps &amp; Games</a>
								| <a href='/books.html'>Books</a>
								| <a href='/words/index.html'>Words</a>
								| <a href='/feed.rss' target='_blank' title='RSS feed'><img src='https://wp-assets.rss.com/blog/wp-content/uploads/2019/10/10111557/social_style_3_rss-512-1.png' style='height:0.9em; vertical-align:middle; margin-right:0.25em' alt='RSS'/>RSS</a>
							</div>
						</div>
					</header>
					${pageTitle}
					<div id='content'>${slots.content}</div>
					<footer>
						${slots.disclaimer ?? DISCLAIMER}
						<p>
							<a href='/terms.html'>terms</a>
							| <a href='/careers.html'>careers</a>
							| <a href='/contribute.html'>contribute code</a>
							| <a href='/about.html'>about</a>
						</p>
						<p>© ${new Date().getFullYear()} thepointless.com - ${PointlessAwardBadge({ size: 'small' })}</p>
					</footer>
				</div>
			</body>
		</html>
	`;
}

// TODO: fix wirejs requiring ... whatever it is here that it requires that breaks the type!
// hydrate(MENU_ID, Account as any);