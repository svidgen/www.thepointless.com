import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import { PointlessCertificate } from '../../../components/pointless-certificate';
import {
	PointlessAwardBadge,
	pointlessAwardEmbedHtml,
	pointlessAwardEmbedMarkdown,
} from '../../../components/pointless-award';
import { getPointlessAward } from '../../../lib/pointless-awards';
import { Main } from '../../../layouts';

function CertificateNotFound({ certificateNumber }: { certificateNumber: string }) {
	return html`<div>
		<p>No certificate bearing the number <code>${certificateNumber}</code> was found in our rigorously maintained files.</p>
		<p>This does not strictly indicate the certificate is invalid. It may simply be moving through the final stages of approval before publication.</p>
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

	const canonicalUrl = `${context.location.origin}/awards/certificates/${award.certificateNumber}`;
	const largeEmbedHtml = pointlessAwardEmbedHtml(award, context.location.origin, 'large');
	const smallEmbedHtml = pointlessAwardEmbedHtml(award, context.location.origin, 'small');
	const embedMarkdown = pointlessAwardEmbedMarkdown(award, context.location.origin);
	const embedSnippets = JSON.stringify({
		'large-html': largeEmbedHtml,
		'small-html': smallEmbedHtml,
		'large-markdown': embedMarkdown,
		'small-markdown': embedMarkdown,
	}).replaceAll('<', '\\u003c');

	return Main({
		title: 'Pointless Award Certificate',
		description: `Certificate ${award.certificateNumber}: ${award.awardName}`,
		content: html`<div>
			${PointlessCertificate({
				kicker: 'The Pointless Award Committee for Recognition of Recognitions hereby recognizes',
				recipient: award.recipient,
				recipientLink: '/',
				recipientLabel: 'as a certified recipient of the',
				title: award.awardName,
				quote: award.quote,
				finePrint: 'This certificate confirms that the aforementioned dot-com has met or exceeded the minimum requirements for receiving this certificate.',
				certificateNumber: award.certificateNumber,
			})}

			<div class='certificate-url-copy'>
				<code>${canonicalUrl}</code>
				<button type='button' data-copy-value='${canonicalUrl}'>Copy certificate URL</button>
			</div>

			<section class='award-embed-options' data-award-snippets='${embedSnippets}'>
				<h3>Display this award elsewhere</h3>
				<p>Recipients may display this badge in other jurisdictions, provided those jurisdictions support HTML and a basic sense of ceremony.</p>

				<div class='award-embed-controls'>
					<div class='award-size-tabs' role='tablist' aria-label='Badge size'>
						<button type='button' data-award-size='large' class='active'>Large</button>
						<button type='button' data-award-size='small'>Small</button>
					</div>
				</div>

				<div class='award-embed-preview' data-award-preview='large'>
					${PointlessAwardBadge({ award, size: 'large', origin: context.location.origin })}
				</div>
				<div class='award-embed-preview' data-award-preview='small' hidden>
					${PointlessAwardBadge({ award, size: 'small', origin: context.location.origin })}
				</div>

				<div class='award-embed-controls'>
					<div class='award-format-tabs' role='tablist' aria-label='Embed format'>
						<button type='button' data-award-format='html' class='active'>HTML</button>
						<button type='button' data-award-format='markdown'>Markdown</button>
					</div>
				</div>

				<label class='award-active-snippet'>
					<span data-award-snippet-label>Large HTML badge</span>
					<textarea readonly data-award-snippet-field>${largeEmbedHtml}</textarea>
				</label>
				<button type='button' data-copy-award-snippet>Copy HTML</button>
			</section>

		</div>`
	});
}

function copyText(value: string, button: HTMLButtonElement) {
	navigator.clipboard.writeText(value).then(() => {
		const original = button.textContent;
		button.textContent = 'Copied';
		setTimeout(() => { button.textContent = original; }, 1000);
	});
}

export function onload() {
	const root = document.querySelector('[data-award-snippets]') as HTMLElement | null;
	if (!root) return;

	const awardSnippets = JSON.parse(root.dataset.awardSnippets || '{}') as Record<string, string>;
	let awardSize = 'large';
	let awardFormat = 'html';

	const refreshAwardEmbedTabs = () => {
		const source = awardSnippets[`${awardSize}-${awardFormat}`];
		const field = root.querySelector('[data-award-snippet-field]') as HTMLTextAreaElement | null;
		const label = root.querySelector('[data-award-snippet-label]');
		const copyButton = root.querySelector('[data-copy-award-snippet]');
		root.querySelectorAll<HTMLElement>('[data-award-preview]').forEach(el => {
			el.hidden = el.dataset.awardPreview !== awardSize;
		});
		if (!source || !field || !label || !copyButton) return;
		field.value = source;
		label.textContent = `${awardSize === 'large' ? 'Large' : 'Small'} ${awardFormat === 'html' ? 'HTML badge' : 'Markdown badge'}`;
		copyButton.textContent = `Copy ${awardFormat === 'html' ? 'HTML' : 'Markdown'}`;
		root.querySelectorAll<HTMLElement>('[data-award-size]').forEach(el => {
			el.classList.toggle('active', el.dataset.awardSize === awardSize);
		});
		root.querySelectorAll<HTMLElement>('[data-award-format]').forEach(el => {
			el.classList.toggle('active', el.dataset.awardFormat === awardFormat);
		});
	};

	document.querySelectorAll<HTMLButtonElement>('[data-copy-value]').forEach(button => {
		button.addEventListener('click', () => copyText(button.dataset.copyValue || '', button));
	});
	root.querySelectorAll<HTMLButtonElement>('[data-award-size]').forEach(button => {
		button.addEventListener('click', () => { awardSize = button.dataset.awardSize || 'large'; refreshAwardEmbedTabs(); });
	});
	root.querySelectorAll<HTMLButtonElement>('[data-award-format]').forEach(button => {
		button.addEventListener('click', () => { awardFormat = button.dataset.awardFormat || 'html'; refreshAwardEmbedTabs(); });
	});
	root.querySelector<HTMLButtonElement>('[data-copy-award-snippet]')?.addEventListener('click', event => {
		const field = root.querySelector('[data-award-snippet-field]') as HTMLTextAreaElement | null;
		if (!field) return;
		field.select();
		copyText(field.value, event.currentTarget as HTMLButtonElement);
	});
	refreshAwardEmbedTabs();
}
