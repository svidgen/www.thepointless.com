import { html } from 'wirejs-dom/v2';

export type PointlessCertificateFields = {
	kicker?: unknown;
	recipient: unknown;
	recipientLabel?: unknown;
	title: unknown;
	quote?: unknown;
	media?: unknown;
	finePrint?: unknown;
	unminted?: boolean;
	certificateNumber?: unknown;
};

export function PointlessCertificate({
	kicker,
	recipient,
	recipientLabel,
	title,
	quote,
	media,
	finePrint,
	unminted = false,
	certificateNumber,
}: PointlessCertificateFields) {
	return html`<section class='pointless-certificate'>
		<div class='certificate-seal' aria-hidden='true'>★</div>
		${kicker ? html`<p class='certificate-kicker'>${kicker}</p>` : ''}
		<h2>${recipient}</h2>
		${recipientLabel ? html`<p>${recipientLabel}</p>` : ''}
		<h3>${title}</h3>
		${media ? html`<div class='certificate-media'>${media}</div>` : ''}
		${quote ? html`<blockquote>“${quote}”</blockquote>` : ''}
		${finePrint ? html`<p class='certificate-fine-print'>${finePrint}</p>` : ''}
		${unminted ? html`<p class='certificate-minting-status'>This ceremonial acknowledgement is currently unminted and carries no certificate number, pending the future establishment of the official minting desk.</p>` : ''}
		${certificateNumber ? html`<p class='certificate-number'>Certificate No. ${certificateNumber}</p>` : ''}
	</section>`;
}
