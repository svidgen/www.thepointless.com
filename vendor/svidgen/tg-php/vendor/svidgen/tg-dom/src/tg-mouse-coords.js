require('tg-box.js');

// TG.MouseCoords
// Determines and stores the Coordinates for a mouse event
TG.MouseCoords = function (event) {
	var e = event || window.event;
	if (e.changedTouches) {
		this.x = e.changedTouches[0].pageX;
		this.y = e.changedTouches[0].pageY;
	} else if (e.pageX || e.pageY) {
		this.x = e.pageX;
		this.y = e.pageY;
	} else if (e.clientX || e.clientY) {
		this.x = e.clientX + document.body.scrollLeft;
		this.y = e.clientY + document.body.scrollTop;
	}
}; // TG.MouseCoords

module.exports = TG.MouseCoords;
