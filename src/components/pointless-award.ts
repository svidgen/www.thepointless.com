import { html } from 'wirejs-dom/v2';
import type { PointlessAward } from '../lib/pointless-awards';
import {
	POINTLESS_AWARD_DISTINCTION,
	POINTLESS_AWARD_NAME,
	pointlessAwards,
} from '../lib/pointless-awards';

const DEFAULT_AWARD = pointlessAwards[0];

type StyleRules = Record<string, string>;

const badgeColors = {
	border: '#b99b3d',
	background: '#fffdf3',
	starBackground: '#ffe68a',
	starText: '#7a5312',
	text: '#533',
	muted: '#888',
	shadow: '#ddd',
} as const;

const baseStyles = {
	link: {
		'align-items': 'center',
		background: badgeColors.background,
		color: badgeColors.text,
		'text-decoration': 'none',
	},
	star: {
		display: 'inline-flex',
		'align-items': 'center',
		'justify-content': 'center',
		flex: '0 0 auto',
		'border-radius': '50%',
		background: badgeColors.starBackground,
		color: badgeColors.starText,
		'line-height': '1',
		'text-shadow': '#fff 1px 1px 0',
	},
	block: {
		display: 'block',
	},
	inline: {
		display: 'inline',
	},
	muted: {
		color: badgeColors.muted,
	},
} as const;

const badgeStyles = {
	largeShell: {
		'box-sizing': 'border-box',
		'max-width': '32rem',
		margin: '1.5rem auto',
	},
	largeLink: {
		...baseStyles.link,
		'box-sizing': 'border-box',
		display: 'flex',
		gap: '0.85rem',
		width: '100%',
		padding: '0.85rem 1rem',
		border: `1px dashed ${badgeColors.border}`,
		'border-radius': '0.5rem',
		font: '16px Georgia, serif',
		'box-shadow': `0 1px 4px ${badgeColors.shadow}`,
	},
	largeStar: {
		...baseStyles.star,
		width: '3rem',
		height: '3rem',
		border: `2px solid ${badgeColors.border}`,
		'font-size': '2rem',
	},
	largeText: {
		'text-align': 'left',
	},
	largeKicker: {
		...baseStyles.block,
		...baseStyles.muted,
		'font-size': '0.85rem',
	},
	smallShell: {
		display: 'inline-block',
		margin: '0 0.15em',
		'vertical-align': 'middle',
	},
	smallLink: {
		...baseStyles.link,
		display: 'inline-flex',
		'vertical-align': 'middle',
		gap: '0.3em',
		padding: '0.1em 0.35em',
		border: `1px dashed ${badgeColors.border}`,
		'border-radius': '0.3em',
		font: 'bold 1em Georgia, serif',
		'line-height': '1.2',
	},
	smallStar: {
		...baseStyles.star,
		width: '1.15em',
		height: '1.15em',
		border: `1px solid ${badgeColors.border}`,
		'font-size': '0.9em',
	},
	smallCert: {
		...baseStyles.muted,
		'font-weight': 'normal',
	},
} as const;

function style(...ruleSets: StyleRules[]) {
	return Object.assign({}, ...ruleSets);
}

function styleAttr(...ruleSets: StyleRules[]) {
	return Object.entries(style(...ruleSets))
		.map(([property, value]) => `${property}:${value};`)
		.join('');
}

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

function largeBadgeHtml(url: string, awardName: string, awardDistinction: string) {
	return `<aside
  aria-label="Pointless Award"
  style="${styleAttr(badgeStyles.largeShell)}"
>
  <a
    href="${url}"
    style="${styleAttr(badgeStyles.largeLink)}"
  >
    <span
      aria-hidden="true"
      style="${styleAttr(badgeStyles.largeStar)}"
    >★</span>
    <span style="${styleAttr(badgeStyles.largeText)}">
      <span style="${styleAttr(badgeStyles.largeKicker)}">Recipient of</span>
      <strong style="${styleAttr(baseStyles.block)}">${awardName}</strong>
      <span style="${styleAttr(baseStyles.block)}">for ${awardDistinction}</span>
    </span>
  </a>
</aside>`;
}

function smallBadgeHtml(url: string, cert: string) {
	return `<span
  aria-label="Pointless Award"
  style="${styleAttr(badgeStyles.smallShell)}"
>
  <a
    href="${url}"
    style="${styleAttr(badgeStyles.smallLink)}"
  >
    <span
      aria-hidden="true"
      style="${styleAttr(badgeStyles.smallStar)}"
    >★</span>
    <span>
      <strong style="${styleAttr(baseStyles.inline)}">Pointless Award</strong>
      <span style="${styleAttr(badgeStyles.smallCert)}">Cert. ${cert}</span>
    </span>
  </a>
</span>`;
}

export function pointlessAwardBadgeHtml(
	award: PointlessAward,
	origin: string,
	size: 'large' | 'small' = 'small'
) {
	const url = escapeHtml(certificateUrl(award, origin));
	const cert = escapeHtml(shortCertificateNumber(award));
	const awardName = escapeHtml(POINTLESS_AWARD_NAME);
	const awardDistinction = escapeHtml(POINTLESS_AWARD_DISTINCTION);

	return size === 'large'
		? largeBadgeHtml(url, awardName, awardDistinction)
		: smallBadgeHtml(url, cert);
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
	return html([pointlessAwardBadgeHtml(award, origin, size)] as unknown as TemplateStringsArray);
}

export function pointlessAwardEmbedHtml(
	award: PointlessAward,
	origin: string,
	size: 'large' | 'small' = 'small'
) {
	return pointlessAwardBadgeHtml(award, origin, size);
}

export function pointlessAwardEmbedMarkdown(award: PointlessAward, origin: string) {
	return `[★ Pointless Award · Cert. ${shortCertificateNumber(award)}](${certificateUrl(award, origin)})`;
}
