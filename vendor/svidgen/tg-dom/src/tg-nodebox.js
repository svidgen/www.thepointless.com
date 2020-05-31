var Box = require('tg-box.js');

TG.NodeBox = function(n) {
	this.x = n.offsetLeft;
	this.y = n.offsetTop;

	var temp = n;
	while (temp = temp.offsetParent) {
		this.x += temp.offsetLeft;
		this.y += temp.offsetTop;
	}

	this.left = this.x;
	this.top = this.y;
	this.width = n.offsetWidth;
	this.height = n.offsetHeight;
	this.right = this.x + this.width;
	this.bottom = this.x + this.height;

	var style = {
		marginLeft: '', marginRight: '', marginTop: '', marginBottom: ''
	};

	this.marginLeft = parseInt(style.marginLeft.replace(/[^0-9]/g, '') || '0');
	this.marginRight = parseInt(style.marginRight.replace(/[^0-9]/g, '') || '0');
	this.marginTop = parseInt(style.marginTop.replace(/[^0-9]/g, '') || '0');
	this.marginBottom = parseInt(style.marginBottom.replace(/[^0-9]/g, '') || '0');
}; // getCoordinates()
TG.NodeBox.prototype = new Box();

module.exports = TG.NodeBox;
