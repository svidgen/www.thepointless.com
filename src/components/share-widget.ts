import { html, id } from 'wirejs-dom/v2';

type ShareWidgetProps = {
	id?: string;
	header?: string;
	title?: string;
	text?: string;
	url?: string;
	preview?: boolean;
};

function absoluteUrl(url: string) {
	if (!url) return location.href;
	return url.charAt(0) === '/' ? location.origin + url : url;
}

function payloadFrom(widget: HTMLElement) {
	return {
		title: widget.dataset.title || document.title,
		text: widget.dataset.text || '',
		url: absoluteUrl(widget.dataset.url || ''),
	};
}

function textFrom(payload: { text: string; url: string }) {
	return [payload.text, payload.url].filter(Boolean).join('\n\n');
}

export function ShareWidget({ id: shareId = '', header = 'Share this pointless thing.', title = '', text = '', url = '', preview = false }: ShareWidgetProps) {
	const self = html`<div id='${shareId}' class='share-widget' data-share-widget data-share-id='${shareId}' data-title='${title}' data-text='${text}' data-url='${url}'>
		<div class='share-widget-header'>${header}</div>
		${preview ? html`<pre class='share-widget-preview' data-share-preview ${id('preview', HTMLPreElement)}>${[text, url].filter(Boolean).join('\n\n')}</pre>` : ''}
		<div class='share-widget-actions'>
			<button type='button' data-share-native ${id('nativeButton', HTMLButtonElement)}><img src='/static/images/native-share.svg' alt='' /> Share</button>
			<button type='button' data-share-copy ${id('copyButton', HTMLButtonElement)}>Copy</button>
		</div>
	</div>`;

	function refreshPreview() {
		const previewElement = self.querySelector('[data-share-preview]');
		if (previewElement) previewElement.textContent = textFrom(payloadFrom(self));
	}

	if (self.data.nativeButton) {
		if (typeof navigator !== 'undefined' && navigator.share) {
			self.data.nativeButton.addEventListener('click', () => {
				const payload = payloadFrom(self);
				return navigator.share({
					title: payload.title,
					text: payload.text,
					url: payload.url,
				});
			});
		} else {
			self.data.nativeButton.hidden = true;
		}
	}

	self.data.copyButton.addEventListener('click', () => {
		navigator.clipboard.writeText(textFrom(payloadFrom(self))).then(() => {
			const original = self.data.copyButton.textContent;
			self.data.copyButton.textContent = 'Copied';
			setTimeout(() => { self.data.copyButton.textContent = original; }, 1000);
		});
	});

	(self as any).refreshSharePreview = refreshPreview;
	refreshPreview();

	return self;
}
