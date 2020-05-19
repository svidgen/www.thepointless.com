require('tg-upon.js');
require('tg-namespace.js');
require('tg-dom.js');
require('tg-mouse-coords.js');

TG.DragDrop = TG.DragDrop || {

	active_draggable: null,
	drops: [],
	draggables: [],

	getCollection: function(o) {
		if (isa(o, 'TG.Draggable')) {
			return this.draggables;
		}
		if (isa(o, 'TG.SortableList')) {
			return this.drops;
		}
	}, // getList()

	contains: function(o) {
		var l = this.getCollection(o);
		for (var i = 0; i < l.length; i++) {
			if (l[i] == o) return i;
		}
		return false;
	}, // contains()

	objectAt: function (x, y, l) {
		var l = l || this.draggables;
		for (var i in l) {
			if (l[i].contains(x, y)) {
				return l[i];
			}
		}
		return null;
	}, // objectAt()

	dropSpotAt: function(x, y) {
		return this.objectAt(x, y, this.drops);
	}, // dropSpotAt()

	handleAt: function (x, y, l) {
		var l = this.draggables;
		var o = this.objectAt(x, y, l);
		if (o) {
			if (o.handleContains(x, y)) {
				return o;
			}
		}
		return null;
	}, // handleAt()

	add: function(o) {
		var c = this.getCollection(o);
		if (!this.contains(o, c)) c.push(o);
	}, // add()

	remove: function(o) {
		var c = this.getCollection(o);
		var i = this.contains(o, c);
		if (i) c.splice(i, 1);
		return i;
	}, // remove()

	grab: function(mc) {
		var o = null;
		if (!this.active_draggable) {
			o = this.handleAt(mc.x, mc.y);
			if (o && isa(o, 'TG.Draggable')) {
				if (typeof (o.enabled) === 'undefined' || o.enabled) {
					o.pickUp(mc, true);
					this.active_draggable = o;
					this.over_spot = this.dropSpotAt(mc.x, mc.y);
					this.over(mc);
				}
			}
		}
		return o;
	}, // grab()

	drag: function(mc) {
		if (this.active_draggable) {
			this.active_draggable.drag(mc);
			this.over(mc);
			return true;
		} else {
			return false;
		}
	}, // drag()

	over: function(mc) {
		var s = mc ? this.dropSpotAt(mc.x, mc.y) : null;
		if (s == null || s != this.over_spot) {
			if (this.over_spot) {
				this.over_spot.dragOut(this.active_draggable);
			}
			if (s) {
				s.dragOver(mc, this.active_draggable);
			}
			this.over_spot = s;
		}
	}, // over()

	drop: function(mc) {
		var o = this.active_draggable;
		if (o) {
			this.active_draggable = null;
			this.over(null);
			var droppedonto = null;
			var t = this.dropSpotAt(mc.x, mc.y) || o.getContainer();
			for (var i = 0; i < this.drops.length; i++) {
				if (this.drops[i] == t) {
					var ok = this.drops[i].dropOver(o, mc)
					droppedonto = ok ? t : null;
				} else {
					// removes any lingering drop preview
					this.drops[i].dropOver(null);
				}
			}
			if (droppedonto) {
				o.drop(mc, droppedonto);
			} else {
				o.return();
			}
			return true;
		} else {
			return false;
		}
	} // drop()

}; // TG.DragDrop


TG.SortableList = function () {
	this.add = function (item) {
		if (item == null) { return; }

		if (isa(item, Array)) {
			for (var i in item) {
				this.add(item[i]);
			}
		} else if (isa(item, 'TG.Draggable')) {
			var doAdd = true;
			for (var i in this.objects) {
				if (this.objects[i] == item) {
					doAdd = false;
					break;
				}
			}

			if (doAdd) {
				if (item.container && typeof (item.container.remove) === 'function') {
					item.container.remove(item);
				}

				item.index = this.objects.length;
				this.objects.push(item);
				item.container = this;

				if (item.parentNode !== this) {
					this.appendChild(item);
				}
			}
		} else {
			this.add(New(TG.Draggable(item, [this])));
		}

	}; // add()

	this.remove = function (item) {
		for (var i = 0; i < this.objects.length; i++) {
			if (this.objects[i] === item) {
				this.objects.splice(i, 1);
			}
		}
		return null;
	}; // remove()

	this.dragStart = function(item) {
		var ok = 1;

		if (typeof(this.ondragstart) == 'function') {
			ok = this.ondragstart(item);
		}

		if (ok) {
			this.remove(item);
			this.drop_preview = this.getDropPreview(item);
			return this.replaceChild(this.drop_preview, item);
		}

		return ok;
	}; // dragStart();

	this.dragOver = function(mc, item) {
		var ok = 1;
		if (typeof(this.ondragover) == 'function') {
			ok = this.ondragover(item);
		}
		if (ok) {
			var ro = TG.DragDrop.objectAt(mc.x, mc.y);
			if (ro == this) ro = null;
			var dp = this.getDropPreview(item);
			dp.move(this, ro);
		}
	}; // dragOver()

	this.dragOut = function(item) {
		this.removeDropPreview();
		if (typeof(this.ondragout) == 'function') {
			this.ondragout(item);
		}
	}; // dragOut()

	this.dropOver = function(o, mc) {
		var ok = Boolean(o);

		if (ok && typeof(this.ondropover) === 'function') {
			ok = this.ondropover(o);
		}

		if (ok && o) {
			this.add(o);
			this.insertBefore(o, this.getDropPreview(o));
		}

		this.removeDropPreview();
		return ok;
	}; // dropOver()

	this.contains = function (x, y) {
		var coords = new TG.NodeCoords(this);
		return coords.contains(x, y);
	}; // contains()

	this.getObjects = function () {
		return this.objects;
	}; // getObjects()

	this.getDropPreview = function(item, s) {
		if (!this.drop_preview) {
			this.drop_preview = New(TG.DropPreview, {container: this});
			copyStyle(
				item,
				this.drop_preview,
				TG.DropPreview.relevantStyles
			);
			this.appendChild(this.drop_preview);
		}
		return this.drop_preview;
	}; // getDropPreview()

	this.removeDropPreview = function() {
		if (this.drop_preview) {
			this.removeChild(this.drop_preview);
			this.drop_preview = null;
			return true;
		} else {
			return false;
		}
	}; // removeDropPreview()

	this.objects = [];
	this.dragging = null;
	this.drop_preview = null;

	// container must be positioned either absolutely or relatively
	// to allow ... ? ... wait ... what?
	if (this.style.position != 'absolute') {
		this.style.position = 'relative';
	}

	setType(this, 'TG.SortableList');

	TG.DragDrop.add(this);

}; // SortableList
Bind(TG.SortableList, 'tg-sortable-list');
Bind(TG.SortableList, 'tg:sortablelist');


// DropSpot
// Spot that holds a single Draggable
TG.DropSpot = function() {
	TG.SortableList.apply(this, arguments);

	this.dragOut = function(item) {
		if (typeof(this.ondragout) == 'function') {
			this.ondragout(item);
		}
	}; // dragOut()

	setType(this, 'TG.DropSpot');
}; // TG.DropSpot
Bind(TG.DropSpot, 'tg-drop-spot');



// Draggable
// Turns a node or object with a .node property into a drag-droppable thing.
// The container parameter can either be a Node or an Array of Nodes
TG.Draggable = function () {
	setType(this, 'TG.Draggable');

	this.container = null;
	this.handle = this.handle || this['data-handle'] || this;
	this.index = 0;
	this.dragging = false;
	this.x_offset = 0;
	this.y_offset = 0;
	this.coords = function () { return new TG.NodeCoords(this); };
	this.old_coords = null;
	this.drop_preview = null;
	this.screen_protector = null;

	this.debug = null;

	this.destroy = function () {
		this.handle.style.cursor = 'default';
		this.o = null;
		this.targets = null;
		this.container = null;
		this.handle = null;
	}; // destroy()

	this.contains = function (x, y) {
		if (!this.dragging) {
			var nc = new TG.NodeCoords(this);
			return nc.contains(x, y);
		} else {
			return false;
		}
	}; // contains()

	this.handleContains = function (x, y) {
		if (!this.dragging) {
			var nc = new TG.NodeCoords(this.handle);
			return nc.contains(x, y);
		} else {
			return false;
		}
	}; // handleContains()

	this.getContainer = function() {
		if (!this.container) {
			if (isa(this.parentNode, 'TG.DropSpot')
				|| isa(this.parentNode, 'TG.SortableList')
			) {
				this.container = this.parentNode;
				this.container.add(this);
			} else if (this.sticky || this['data-sticky']) {
				this.container = New(TG.DropSpot);
				copyStyle(
					this,
					this.container,
					['display','position','float','clear']
				);
				this.parentNode.insertBefore(this.container, this);
				this.container.add(this);
			}
		}
		return this.container;
	}; // getContainer()

	this.pickUp = function(mc) {
		this.screen_protector = New(TG.ScreenProtector);
		document.body.appendChild(this.screen_protector);

		this.old_coords = new TG.NodeCoords(this);
		this.x_offset = mc.x - this.coords().x;
		this.y_offset = mc.y - this.coords().y;

		var _t = this;

		var c = this.getContainer();
		if (c) {
			c.dragStart(this);
			this.returnto = c;
		}

		// flag it as being dragged.
		this.dragging = true;
		this.setStyles();
		document.body.appendChild(this);

		this.style.left = (mc.x - this.x_offset) + 'px';
		this.style.top = (mc.y - this.y_offset) + 'px';
	}; // pickUp()

	this.drag = function (mc) {
		this.style.left = (mc.x - this.x_offset) + 'px';
		this.style.top = (mc.y - this.y_offset) + 'px';
	}; // drag()

	this.drop = function (mc, t) {
		if (this.screen_protector) {
			this.screen_protector = this.screen_protector.remove();
		}

		this.dragging = false;
		this.setStyles();

		if (typeof(this.ondrop) == 'function') {
			this.ondrop(mc, t);
		}
	}; // drop()

	this.setStyles = function() {
		if (this.dragging) {	
			this.style.opacity = 0.5;
			this.style.filter = 'alpha(opacity=50)';
			this.style.position = 'absolute';
			this.style.zIndex = 1000;
		} else {
			if (this.getContainer()) {
				this.style.position = '';
				this.style.left = '';
				this.style.top = '';
				this.style.zIndex = '';
			}

			this.style.opacity = '';
			this.style.filter = '';

			this.x_offset = 0;
			this.y_offset = 0;
		}
	}; // setStyles()

	this.return = function() {
		if (this.returnto) {
			this.returnto.add(this);
		}
		this.drop(null, null);
	}; // return()

	this.hide = function() {
		this._display = this.style.display;
		this.style.display = 'none';
	}; // hide()

	this.show = function() {
		this.style.display = this._display || '';
	}; // show()

	TG.DragDrop.add(this);

}; // Draggable

TG.Draggable.compare = function (a, b) {
	if (a.index > b.index) {
		return 1;
	} else {
		return -1;
	}
}; // Draggable.compare()

Bind(TG.Draggable, 'tg-draggable');
Bind(TG.Draggable, 'tg:draggable');


// DropPreview
// The placeholder that's moved around the DropZones during dragging.
TG.DropPreview = function () {
	setType(this, 'TG.DropPreview');

	this.index = 0;

	this.contains = function (x, y) {
		var nc = new TG.NodeCoords(this);
		return nc.contains(x, y);
	}; // contains()

	// wait. what is this? why is it commented out? what was it supposed to
	// accomplish to begin with!?
	this.move = function (container, o) {
		/*
		var inspace = false;
		if (!this.drop_preview.contains(mc.x, mc.y)) {
			inspace = true;
			var o = DragDrop.objectAt(mc.x, mc.y);
			var oc = o.getContainer();
			for (var i = 0; i < this.targets.length; i++) {
				if (this.targets[i] == oc) {
					this.drop_preview.move(oc, o);
					inspace = false;
				}
			}
		}

		if (
			inspace
			&& (this.prefer_home || this.preferHome)
			&& isa(this.home, Node)
		) {
			this.drop_preview.move(this.home);
		}

		if (o === this) {
			return;
		}

		if (container !== this.container) {
			if (typeof (container.onmoveover) === 'function') {
				container.onmoveover(o);
			}
			if (this.container && typeof (this.container.onmoveout) === 'function') {
				this.container.onmoveout(o);
			}
		}

		if (o) {
			this.container = container;
			if (o.previousSibling === this) {
				o.parentNode.insertBefore(this, o.nextSibling);
				this.index = o.index + 1;
			} else {
				o.parentNode.insertBefore(this, o);
				this.index = o.index;
			}
		} else if (container && isa(container, Node)) {
			this.container = container;
			container.appendChild(this);
			for (var i = 0; i < container.objects.length; i++) {
				if (this.index <= container.objects.length) {
					this.index = container.objects.length;
				}
			}
			this.index += 1;
		}
		*/
	}; // move()

	this.style.border = '2px solid green';

}; // TG.DropPreview
TG.DropPreview.templateMarkup = "&nbsp;";
TG.DropPreview.relevantStyles = [
	'display','position','width','height','top','left','border-width','margin',
	'padding', 'float','clear'
];
Bind(TG.DropPreview, 'tg-drop-preview');


// ScreenProtector
// Invisible node that covers the screen during drag-dropping to prevent
// inadvertent text highlighting and image or link dragging.
TG.ScreenProtector = function () {

	setType(this, 'TG.ScreenProtector');

	this.remove = function () {
		document.body.removeChild(this);
		return null;
	} // remove()

}; // ScreenProtector
TG.ScreenProtector.templateMarkup = " ";
Bind(TG.ScreenProtector, 'tg-screen-protector');


// TG.NodeCoords
// Determines and contains the coordinates for a node.
TG.NodeCoords = function (n) {

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
	this.right = this.x + n.offsetWidth;

	this.height = n.offsetHeight;
	this.bottom = this.y + n.offsetHeight;

	var style = {
		marginLeft: "", marginRight: "",
		marginTop: "", marginBottom: ""
	};

	if (n.currentStyle) {
		style = n.currentStyle;
	} else if (window.getComputedStyle) {
		style = getComputedStyle(n);
	}

	this.marginLeft =
		parseInt(style.marginLeft.replace(/[^0-9]/g, '') || '0');
	this.marginRight =
		parseInt(style.marginRight.replace(/[^0-9]/g, '') || '0');
	this.marginTop =
		parseInt(style.marginTop.replace(/[^0-9]/g, '') || '0');
	this.marginBottom =
		parseInt(style.marginBottom.replace(/[^0-9]/g, '') || '0');

	this.contains = function (x, y) {
		var ex = this.x - Math.ceil(this.marginLeft / 2);
		var ey = this.y - Math.ceil(this.marginTop / 2);
		var eright = this.right * 1 + Math.ceil(this.marginRight / 2);
		var ebottom = this.bottom * 1 + Math.ceil(this.marginBottom / 2);
		if (x >= ex && x <= eright && y >= ey && y <= ebottom) {
			return true;
		} else {
			return false;
		}
	}; // contains()

}; // TG.NodeCoords


document.onmousedown = function (evt) {
	var e = evt || window.event;
	var mc = new TG.MouseCoords(e);
	if (TG.DragDrop.grab(mc) && typeof(e.preventDefault) == 'function') {
		e.preventDefault();
	}
}; // document.onmousedown()

document.onmousemove = function (evt) {
	var e = evt || window.event;
	var mc = new TG.MouseCoords(e);
	if (TG.DragDrop.drag(mc) && typeof(e.preventDefault) == 'function') {
		e.preventDefault();
	}
}; // document.onmousemove()

document.onmouseup = function (evt) {
	var e = evt || window.event;
	var mc = new TG.MouseCoords(e);
	if (TG.DragDrop.drop(mc) && typeof(e.preventDefault) == 'function') {
		e.preventDefault();
	}
}; // document.onmouseup()

document.ontouchstart = document.onmousedown;
document.ontouchmove = document.onmousemove;
document.ontouchend = document.onmouseup;
document.ontouchleave = document.onmouseup;
document.ontouchcancel = document.onmouseup;

console.log('TG.DragDrop loaded. (2)');
