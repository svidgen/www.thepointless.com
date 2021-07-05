const { DomClass } = require('wirejs-dom');

const template = `<tpdc:simpleresult>
	<div>
		<span data-id='text'></span>
		<span data-id='value'><span>.
	</div>
</tpdc:simpleresult>`;

const SimpleResult = DomClass(template, function _SimpleResult() {
	const url = new URL(location).searchParams;
	this.text = this.text || url.get('text');
	this.value = this.value || url.get('value');
});
