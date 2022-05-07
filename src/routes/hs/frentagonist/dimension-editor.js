const { DomClass } = require('wirejs-dom');

const Radio = require('./radio');

// TODO: fix impurity. includes css and superfluous container div
const markup = `<ft:editdimension>
	<div style='margin: 1em;'>
		<div><b data-id='label'></b></div>
		<div data-id='options'></div>
		<div data-id='hiddenForm' style='display: none;'>
			<input type='text' data-id='innerValue' data-property='value' />
		</div>
	</div>
</fd:editdimension>`;

const DimensionEditor = DomClass(markup, function _DimensionEditor() {
	if (this.values instanceof Array) {
		this.options = this.values.map(value => new Radio({
			name: this.label,
			value,
			onselect: value => {
				this.innerValue = value;
				console.debug(`${this.label} => ${this.innerValue}`);
			}
		}));
	} else {
		this.hiddenForm.style.display = '';
	}

	Object.defineProperty(this, 'value', {
		get() {
			return this.innerValue;
		},
		set(value) {
			if (this.options instanceof Array) {
				this.options.forEach(o => {
					if (o.label === value) {
						o.select();
					}
				})
			}
			this.innerValue = value ?? '';
		}
	})

	this.value = this.preset;
});

module.exports = DimensionEditor;
