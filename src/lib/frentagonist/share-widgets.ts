import { html, id } from 'wirejs-dom/v2';

type ShareCopyWidgetProps = {
	label: string;
	value: string;
	multiline?: boolean;
	fieldAttribute: 'data-share-link' | 'data-share-string';
};

export function ShareCopyWidget({ label, value, multiline = false, fieldAttribute }: ShareCopyWidgetProps) {
	const self = html`<label class='frentagonist-share-widget'>
		<span>${label}</span>
		${multiline ? html`<textarea readonly ${fieldAttribute} ${id('field')}>${value}</textarea>` : html`<input readonly ${fieldAttribute} value='${value}' ${id('field')} />`}
		<button type='button' ${id('copy')}>Copy</button>
	</label>`;

	self.data.copy.addEventListener('click', () => {
		self.data.field.select();
		navigator.clipboard.writeText(self.data.field.value).then(() => {
			const original = self.data.copy.textContent;
			self.data.copy.textContent = 'Copied';
			setTimeout(() => { self.data.copy.textContent = original; }, 1000);
		});
	});

	return self;
}

export function FrentagonistShareWidgets({ link, glyphs }: { link: string; glyphs: string }) {
	return html`<div class='frentagonist-share-widgets' data-id='actions'>
		${ShareCopyWidget({ label: 'Share link', value: link, fieldAttribute: 'data-share-link' })}
		${ShareCopyWidget({ label: 'Share glyphs', value: glyphs, multiline: true, fieldAttribute: 'data-share-string' })}
	</div>`;
}
