const { DomClass } = require('wirejs-dom');

const DimensionView = DomClass(`<ft:dimensionview>
	<label data-id='label' style='font-weight: bold;'></label>
	<span data-id='value'></span>
</ft:dimensionview>`);

module.exports = DimensionView;
