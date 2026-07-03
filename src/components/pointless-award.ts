import { html } from 'wirejs-dom/v2';
import type { PointlessAward } from '../lib/pointless-awards';
import { pointlessAwards } from '../lib/pointless-awards';

const DEFAULT_AWARD = pointlessAwards[0];

function certificateUrl(award: PointlessAward, origin = '') {
	return `${origin}/awards/certificates/${award.certificateNumber}`;
}

function shortCertificateNumber(award: PointlessAward) {
	return award.certificateNumber.split('-').at(-1) || award.certificateNumber;
}

function escapeHtml(value: string) {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function PointlessAwardBadge({
	award = DEFAULT_AWARD,
	size = 'large',
	origin = '',
}: {
	award?: PointlessAward;
	size?: 'large' | 'small';
	origin?: string;
} = {}) {
	if (size === 'small') {
		return html`<span class='pointless-award-badge small' aria-label='Pointless Award'>
			<a href='${certificateUrl(award, origin)}'>
				<span class='award-star' aria-hidden='true'>★</span>
				<span><strong>Pointless Award</strong> <span class='award-cert-id'>Cert. ${shortCertificateNumber(award)}</span></span>
			</a>
		</span>`;
	}

	return html`<aside class='pointless-award-badge' aria-label='Pointless Award'>
		<a href='${certificateUrl(award, origin)}'>
			<span class='award-star' aria-hidden='true'>★</span>
			<span>
				<span class='award-kicker'>Recipient of the</span>
				<strong>Pointless Award</strong>
				<span>for Excellence in Unnecessary Internet</span>
			</span>
		</a>
	</aside>`;
}

export function pointlessAwardEmbedHtml(award: PointlessAward, origin: string, size: 'large' | 'small' = 'small') {
	const url = escapeHtml(certificateUrl(award, origin));
	const cert = escapeHtml(shortCertificateNumber(award));

	if (size === 'large') {
		return `<a href="${url}" style="box-sizing:border-box;display:flex;align-items:center;gap:0.85rem;width:100%;max-width:32rem;padding:0.85rem 1rem;border:1px dashed #b99b3d;border-radius:0.5rem;background:#fffdf3;color:#533;font:16px Georgia,serif;text-decoration:none;box-shadow:0 1px 4px #ddd;">
  <span aria-hidden="true" style="display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:3rem;height:3rem;border-radius:50%;border:2px solid #b99b3d;background:#ffe68a;color:#7a5312;font-size:2rem;line-height:1;text-shadow:#fff 1px 1px 0;">★</span>
  <span style="text-align:left;"><span style="display:block;color:#888;font-size:0.85rem;">Recipient of the</span><strong style="display:block;">Pointless Award</strong><span style="display:block;">for Excellence in Unnecessary Internet</span></span>
</a>`;
	}

	return `<a href="${url}" style="display:inline-flex;align-items:center;vertical-align:middle;gap:0.3em;padding:0.1em 0.35em;border:1px solid #b99b3d;border-radius:0.3em;background:#fffdf3;color:#533;font:bold 1em Georgia,serif;line-height:1.2;text-decoration:none;">
  <span aria-hidden="true" style="color:#7a5312;">★</span>
  <span>Pointless Award · Cert. ${cert}</span>
</a>`;
}

export function pointlessAwardEmbedMarkdown(award: PointlessAward, origin: string) {
	return `[★ Pointless Award · Cert. ${shortCertificateNumber(award)}](${certificateUrl(award, origin)})`;
}
