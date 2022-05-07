const { DomClass } = require('wirejs-dom');

const DimensionView = DomClass(`<ft:dimensionview>
	<div>
		<label data-id='label' style='font-weight: bold;'></label>:
		<span data-id='value'></span>
	</div>
</ft:dimensionview>`);

module.exports = DimensionView;
