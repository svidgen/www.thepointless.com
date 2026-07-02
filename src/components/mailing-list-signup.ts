import { html } from 'wirejs-dom/v2';

type MailingListSignupProps = {
	title?: string;
};

export function MailingListSignup(props: MailingListSignupProps = {}) {
	return html`<form class='mailing-list-signup' action='https://thepointless.us8.list-manage.com/subscribe/post?u=8926784f5726c51e66d93f9ee&amp;id=c6e4ec65e6&amp;f_id=007578e0f0' method='post' target='_blank'>
		<h3>${props.title || 'Subscribe to Pointless Emails'}</h3>
		<label>
			<span>Email Address</span>
			<input type='email' name='EMAIL' required />
		</label>
		<div aria-hidden='true' style='position: absolute; left: -5000px;'>
			<input type='text' name='b_8926784f5726c51e66d93f9ee_c6e4ec65e6' tabindex='-1' value='' />
		</div>
		<button type='submit'>Subscribe</button>
		<p class='mailchimp-branding'>
			<a href='http://eepurl.com/izMwmk' title='Mailchimp - email marketing made easy and fun' target='_blank' rel='noopener'>
				<img src='https://digitalasset.intuit.com/render/content/dam/intuit/mc-fe/en_us/images/intuit-mc-rewards-text-dark.svg' alt='Intuit Mailchimp' />
			</a>
		</p>
	</form>`;
}
