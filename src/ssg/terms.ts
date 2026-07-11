import { html } from 'wirejs-dom/v2';
import { Main } from '../layouts';

export async function generate() {
	return Main({
		title: 'Terms of Use',
		content: html`
			<div>
				<style>
					h3 { margin-top: 2rem; margin-bottom: 0.5rem; }
					#tos p, #tos li { font-size: 0.98rem; line-height: 1.5; }
				</style>

				<div id='tos'>
					<p>Welcome to our highly esteemed dot-com. As we have repeatedly stated, it's all serious business here. As such, here are our terms.</p>

					<h3>1. Use of the Site</h3>
					<p>You may use thepointless.com only in compliance with applicable law and these Terms. You may not use the site in a way that could interfere with its operation, security, or availability, or in a way that attempts to access information or systems you are not authorized to access.</p>

					<h3>2. Privacy and Data</h3>
					<p>We may collect and use information that is reasonably necessary to operate, maintain, and improve the site. This may include information you submit directly, basic usage data, and technical data such as browser or device information. The site may also use third-party services, including analytics, advertising, or other infrastructure providers, each of which may collect data according to its own policies.</p>

					<h3>3. Accounts and Access</h3>
					<p>If the site offers accounts, profiles, or other access-controlled features, you are responsible for maintaining the confidentiality of your login credentials and for activity occurring under your account. We may suspend or terminate access to accounts or features if reasonably necessary to protect the site, its users, or our operations.</p>

					<h3>4. User Submissions</h3>
					<p>If you submit comments, content, messages, or other material to the site, you retain ownership of your content, but you grant thepointless.com a non-exclusive, worldwide, royalty-free license to host, store, reproduce, display, adapt, and distribute that content as reasonably necessary to operate, promote, archive, and improve the site and related services. You represent that you have the rights necessary to provide that content and that it does not violate applicable law or the rights of others.</p>

					<h3>5. Intellectual Property</h3>
					<p>Unless otherwise stated, the site design, copy, graphics, software, and other site materials are owned by or licensed to thepointless.com and are protected by applicable intellectual property laws. These Terms do not grant you any ownership rights in the site or its materials except for the limited right to use the site as permitted here.</p>

					<h3>6. Products, Downloads, and Other Things</h3>
					<p>If the site offers products, downloads, digital goods, memberships, certificates, or other purchasable or redeemable items, additional terms may apply to those offerings. We may change, discontinue, or limit offerings at any time. Any product descriptions, release dates, and availability statements are provided in good faith but may change without notice, because even serious business occasionally encounters logistics.</p>

					<h3>7. No Warranty</h3>
					<p>To the fullest extent permitted by law, the site and any related content, products, or services are provided on an “as is” and “as available” basis, without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, title, and non-infringement. We do not guarantee that the site will be uninterrupted, error-free, secure, or free of defects.</p>

					<h3>8. Limitation of Liability</h3>
					<p>To the fullest extent permitted by law, thepointless.com and its operators, contributors, licensors, and service providers will not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, or for any loss of profits, revenues, data, goodwill, or business opportunities arising out of or related to your use of the site or any related content, products, or services. Where the law does not allow certain limitations, those limitations apply only to the extent permitted.</p>

					<h3>9. Third-Party Links and Services</h3>
					<p>The site may link to third-party websites or use third-party tools and services. We are not responsible for third-party content, policies, availability, or practices. Your use of those services is governed by the terms and policies of the relevant third party.</p>

					<h3>10. Changes to the Site or Terms</h3>
					<p>We may modify the site, these Terms, or related policies from time to time. Updated Terms will be effective upon posting unless a later effective date is stated. Your continued use of the site after changes become effective constitutes acceptance of the revised Terms.</p>

					<h3>11. Governing Law</h3>
					<p>These Terms are governed by the laws applicable in the jurisdiction from which the site is operated, without regard to conflict-of-law rules, except where applicable law requires otherwise.</p>

					<h3>12. Severability</h3>
					<p>If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect to the fullest extent permitted by law.</p>

					<h3>13. Contact</h3>
					<p>If you have questions about these Terms, the most practical current approach is to contact us through the repository or site channels we make available.</p>
				</div>
			</div>
		`
	});
}
