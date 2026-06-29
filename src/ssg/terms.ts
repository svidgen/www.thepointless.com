import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Terms of Use',
		content: html`
			<style>
				h5 { margin-top: 2em; margin-bottom: 0.5em; text-decoration: underline; }
				#tos div { font-size: smaller; }
			</style>

			<div id='tos'>
			<div>Welcome to thepointless.com. The content here is intended as entertainment and absurdity. Nothing on this site constitutes professional advice (legal, financial, medical, or otherwise). Use of the site is at your own risk. By using this site you acknowledge that items are often humorous, satirical, or fictitious.</div>

			<h5>PRIVACY</h5>
			<div>We collect minimal data required for site operation. We may use third-party services (analytics, ad providers) which have their own data practices. We do not sell personal data intentionally. If you have concerns, please contact the site operator.</div>

			<h5>COPYRIGHT</h5>
			<div>Content on this site is © thepointless.com unless otherwise noted. Submissions you provide may be used under a royalty-free license referenced in the contributor terms.</div>

			<h5>DISCLAIMER</h5>
			<div>The site and its contents are provided “as is” for entertainment. We make no warranties of any kind. You should not rely on content here for making real-world decisions. If you do, that is your choice and your responsibility.</div>

			<h5>LIMITATION OF LIABILITY</h5>
			<div>To the fullest extent permitted by law, the site’s owner is not liable for any damages arising from use of the site, including direct, indirect, incidental, special, or consequential damages.</div>

			<h5>ACCEPTABLE USE</h5>
			<div>Be kind. Do not use the site to harass, defame, or otherwise harm others. We reserve the right to remove content or block users who abuse the service.</div>

			<h5>MODIFICATIONS</h5>
			<div>We may change these terms without notice. Continued use of the site constitutes acceptance of the revised terms.</div>

			<h5>CONTACT</h5>
			<div>If you need to contact the operator about these terms, please use the contact link on the site.</div>
			</div>
		`
	});
}
