import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { getPointlessAward } from '../../../lib/pointless-awards';
import { Main } from '../../../layouts';

function CertificateNotFound({ certificateNumber }: { certificateNumber: string }) {
	return html`<div>
		<p>No certificate bearing the number <code>${certificateNumber}</code> was found in our highly rigorous filing cabinet.</p>
		<p>This does not mean the certificate is invalid. It may simply be too important for you to see.</p>
	</div>`;
}

export async function generate(context: Context) {
	if (context.location.pathname.endsWith('.html')) {
		context.location = new URL(
			context.location.pathname.replace(/\.html$/, '') + context.location.search,
			context.location.origin
		);
		return html`<html><body>Redirecting ...</body></html>`;
	}

	const certificateNumber = context.location.pathname
		.split('/')
		.pop()!;

	const award = getPointlessAward(certificateNumber);

	if (!award) {
		return Main({
			title: 'Pointless Award Certificate',
			content: CertificateNotFound({ certificateNumber }),
		});
	}

	return Main({
		title: 'Pointless Award Certificate',
		description: `Certificate ${award.certificateNumber}: ${award.awardName}`,
		content: html`<div>
			<section class='pointless-certificate'>
				<div class='certificate-seal' aria-hidden='true'>★</div>
				<p class='certificate-kicker'>The Pointless Award Committee for Recognition of Recognitions hereby recognizes</p>
				<h2>${award.recipient}</h2>
				<p>as a certified recipient of the</p>
				<h3>${award.awardName}</h3>
				<blockquote>“${award.quote}”</blockquote>
				<p class='certificate-fine-print'>This certificate confirms that the aforementioned dot-com has met or exceeded the minimum requirements for receiving this certificate.</p>
				<p class='certificate-number'>Certificate No. ${award.certificateNumber}</p>
			</section>

			<p style='text-align: center;'>
				<a href='/'>Return to the aforementioned dot-com</a>
			</p>
		</div>`
	});
}
