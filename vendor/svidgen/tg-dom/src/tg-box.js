TG.Box = function(x, y, w, h, mt, mr, mb, ml) {
	this.x = x || 0;
	this.y = y || 0;
	this.width = w || 0;
	this.height = h || 0;
	this.marginTop = mt || 0;
	this.marginRight = mr || 0;
	this.marginBottom = mb || 0;
	this.marginLeft = ml || 0;

	this.contains = function(x, y) {
		var ex = this.x - Math.ceil(this.marginLeft/2);
		var ey = this.y - Math.ceil(this.marginTop/2);
		var eright = this.x + this.width - Math.ceil(this.marginRight/2);
		var ebottom = this.y + this.height - Math.ceil(this.marginBottom/2);
		if (x >= ex && x <= eright && y >= ey && y <= ebottom) {
			return true;
		} else {
			return false;
		}
	}; // contains()

	this.getBottom = function() {
		return this.y + this.height;
	}; // getCorners()

	this.getRight = function() {
		return this.x + this.width;
	}; // getCorners()

	this.rangeOverlaps = function(aMin, aMax, bMin, bMax) {
		return aMin <= bMax && bMin <= aMax;
	}; // lineOverlaps()

	this.xOverlaps = function(box) {
		return this.rangeOverlaps(
			this.x, this.getRight(), box.x, box.getRight()
		);
	}; // xOverlaps()

	this.yOverlaps = function(box) {
		return this.rangeOverlaps(
			this.y, this.getBottom(), box.y, box.getBottom()
		);
	}; // yOverlaps()

	this.overlaps = function(box) {
		return this.xOverlaps(box) && this.yOverlaps(box);
	}; // overlaps()

}; // TG.Box()

module.exports = TG.Box;
