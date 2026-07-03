import { html } from 'wirejs-dom/v2';
import type { Context } from 'wirejs-resources';
import {
	PointlessAwardBadge,
	pointlessAwardEmbedHtml,
	pointlessAwardEmbedMarkdown,
} from '../../../components/pointless-award';
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

			<div class='certificate-url-copy'>
				<code>${canonicalUrl}</code>
				<button type='button' data-copy-value='${canonicalUrl}'>Copy certificate URL</button>
			</div>

			<p style='text-align: center;'>
				<a href='/'>Return to the aforementioned dot-com</a>
			</p>

			<section class='award-embed-options'>
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

			<script>
				var awardSnippets = ${embedSnippets};

				function copyText(value, button) {
					navigator.clipboard.writeText(value).then(function() {
						var original = button.textContent;
						button.textContent = 'Copied';
						setTimeout(function() { button.textContent = original; }, 1000);
					});
				}

				document.querySelectorAll('[data-copy-previous]').forEach(function(button) {
					button.addEventListener('click', function() {
						var textarea = button.previousElementSibling;
						textarea.select();
						copyText(textarea.value, button);
					});
				});

				document.querySelectorAll('[data-copy-value]').forEach(function(button) {
					button.addEventListener('click', function() {
						copyText(button.dataset.copyValue, button);
					});
				});

				var awardSize = 'large';
				var awardFormat = 'html';
				function refreshAwardEmbedTabs() {
					var key = awardSize + '-' + awardFormat;
					var source = awardSnippets[key];
					var field = document.querySelector('[data-award-snippet-field]');
					var label = document.querySelector('[data-award-snippet-label]');
					var copyButton = document.querySelector('[data-copy-award-snippet]');
					document.querySelectorAll('[data-award-preview]').forEach(function(el) {
						el.hidden = el.dataset.awardPreview !== awardSize;
					});
					if (!source || !field || !label || !copyButton) return;
					field.value = source;
					label.textContent = (awardSize === 'large' ? 'Large' : 'Small') + ' ' + (awardFormat === 'html' ? 'HTML badge' : 'Markdown badge');
					copyButton.textContent = 'Copy ' + (awardFormat === 'html' ? 'HTML' : 'Markdown');
					document.querySelectorAll('[data-award-size]').forEach(function(el) {
						el.classList.toggle('active', el.dataset.awardSize === awardSize);
					});
					document.querySelectorAll('[data-award-format]').forEach(function(el) {
						el.classList.toggle('active', el.dataset.awardFormat === awardFormat);
					});
				}
				document.querySelectorAll('[data-award-size]').forEach(function(button) {
					button.addEventListener('click', function() { awardSize = button.dataset.awardSize; refreshAwardEmbedTabs(); });
				});
				document.querySelectorAll('[data-award-format]').forEach(function(button) {
					button.addEventListener('click', function() { awardFormat = button.dataset.awardFormat; refreshAwardEmbedTabs(); });
				});
				document.querySelector('[data-copy-award-snippet]').addEventListener('click', function() {
					var field = document.querySelector('[data-award-snippet-field]');
					field.select();
					copyText(field.value, this);
				});
				refreshAwardEmbedTabs();
			</script>
		</div>`
	});
}
