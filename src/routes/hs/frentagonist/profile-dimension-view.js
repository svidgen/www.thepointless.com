const { DomClass } = require('wirejs-dom');

const markup = `<ft:profiledimensionview>
	<label data-id='label'></label>
	<span data-id='value'></span>
</ft:profiledimensionview>`;

const ProfileDimensionView = DomClass(markup, function() {

});

module.exports = ProfileDimensionView;