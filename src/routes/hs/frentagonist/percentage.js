const { DomClass } = require('wirejs-dom');

const markup = `<ft:percentage>
	<span data-id='valueView'></span>%
	(<span data-id='emoji'></span>)
</ft:percentage>`;

const Percentage = DomClass(markup, function() {
	Object.defineProperty(this, 'value', {
		get() {
			return this.valueValue;
		},
		set(value) {
			this.valueView = value;
			if (value < 5) {
				this.style.color = 'darkred';
				this.emoji = '⚔️';
			} else if (value < 16) {
				this.style.color = 'darkorange';
				this.emoji = '🤼‍♂️';
			} else if (value < 65) {
				this.style.color = 'darkblue';
				this.emoji = '🤝';
			} else {
				this.style.color = 'darkgreen';
				this.emoji = '🍻';
			}
		}
	})
});

module.exports = Percentage;