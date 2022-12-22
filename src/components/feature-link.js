const { DomClass } = require('wirejs-dom');
require('./feature-link.css');

const markup = `<tpdc:featurelink>
	<a data-id='imageLink'><img
		src='/images/qr-code.svg'
		data-id='icon'
		data-property='src'
	/></a>
	<a data-id='titleLink'><h4 data-id='title'></h4></a>
	<div data-id='description'></div>
</tpdc:featurelink>`;

const FeatureLink = DomClass(markup, function() {
	if (this.target) {
		this.imageLink.target = this.target;
		this.titleLink.target = this.target;
	}

	if (this.href) {
		this.imageLink.href = this.href;
		this.titleLink.href = this.href;
	}
});

module.exports = FeatureLink;