const { DomClass } = require('wirejs-dom');

const template = `<tpdc:resultcard>
<!-- ResultCard Responsive -->
	<ins class=\"adsbygoogle\"
		style=\"display: block;\"
		data-ad-client=\"ca-pub-6115341109827821\"
		data-ad-slot=\"7180845135\"
		data-ad-format=\"auto\"></ins>
	<br />
	<h1 class='result-title'><div data-id='header'>Congratulations!</div></h1>
	<div data-id='imageContainer' class='result-image'>
		<img data-id='imageImg' style='display: none;' />
	</div>
	<h3 class='result-result'><div data-id='result'></div></h3>
	<div class='result-description'><div data-id='description'></div></div>
	<tpdc:share data-id='share_buttons'></tpdc:share>
	<hr />
	<tpdc:subscribe></tpdc:subscribe>
</tpdc:resultcard>`;

// temporarily removed until we can update sharing text, etc.


const ResultCard = DomClass(template, function _ResultCard() {
	var _t = this;

	this.setImage = function(src) {
		if (src) {
			this.imageImg.src = src;
			this.imageImg.style.display = '';
		} else {
			this.imageImg.style.display = 'none';
		}
	}; // setImage()

	this.setImage(this.image);

	this.__dom.header.innerHTML = this.__dom.header.innerHTML.replace('{subject}', 'You');
	this.__dom.result.innerHTML = this.__dom.result.innerHTML.replace('{subject}', 'You');
	this.__dom.description.innerHTML = this.__dom.description
		.innerHTML.replace('{subject}', 'You');

	setTimeout(function() {
		(window.adsbygoogle = window.adsbygoogle || []).push({});
	}, 250);

});
