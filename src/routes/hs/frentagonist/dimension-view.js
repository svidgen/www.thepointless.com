const { DomClass } = require('wirejs-dom');

const markup = `<ft:dimensionview>
	<p>
		<label data-id='label' style='font-weight: bold;'></label>:
		<span data-id='value'></span>
	</p>
</ft:dimensionview>`;

const DimensionView = DomClass(markup, function() {

});

module.exports = DimensionView;