import { html } from 'wirejs-dom/v2';

type SocialShareProps = {
	header?: string;
	url?: string;
	title?: string;
	text?: string;
	id?: string;
};

export function SocialShare(props: SocialShareProps = {}) {
	const id = props.id || '';
	return html`<div class='social-share' data-share-id='${id}' data-url='${props.url || ''}' data-title='${props.title || ''}' data-text='${props.text || ''}'>
		<div class='social-share-header'>${props.header || "Make it happen, Cap'n."}</div>
		<div class='social-share-links'>
			<a class='social-share-link facebook' data-provider='facebook' target='_blank' rel='noopener'><img src='/static/images/fb_icon_22px.png' alt='' /> Facebook</a>
			<a class='social-share-link twitter' data-provider='twitter' target='_blank' rel='noopener'><img src='/static/images/twitter_logo_22px.png' alt='' /> Twitter</a>
			<a class='social-share-link email' data-provider='email'><img src='/static/images/email_logo_22px_h.png' alt='' /> Email</a>
			<button type='button' class='social-share-link native' data-provider='native'><img src='/static/images/native-share.svg' alt='' /> Share</button>
			<button type='button' class='social-share-link copy' data-provider='copy'>📋 Copy</button>
		</div>
	</div>`;
}
