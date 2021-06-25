// addtional methods for generic object
var PropertyList = function(o) {
	this.o = o;

	this.toHTML = function() {
		var rv = [];
		var classname = ['a','b'];
		var c = 0;
		for (var i in this.o) {
			rv.push("<tr class='" + classname[c % classname.length] + "'><td>" + i + "</td><td>" + this.o[i] + "</td></tr>");
			c++;
		}
		return "<table class='propertylist'>" + rv.join("\n") + "</table>";
	} // toHTM()
} // PropertyList


// generic/base monster class
var Monster = function Monster(level, game, x, y) {
	
	var container = game.container;

	this.init = function() {
		// init()
		this.g = game;
		this.level = Math.max(level, 1);
		this.initial_level = this.level;
		this.hp = game.c.monster_hp(this.level);
		this.initial_hp = this.hp;
		this.power = game.c.monster_power(this.level);
		this.x = x || 0;
		this.y = y || 0;
		this.ex = 0;
		this.ey = 0;
		this.cx = 0;
		this.cy = 0;
		this.heading = Math.random();
		this.ca = [];
		this.dying = false;
		this.dead = false;
		this.node = document.createElement('div');
		this.node.className = 'monster';
		this.node.js_object = this;
		this.health_bar = document.createElement('div');
		this.health_bar.style.height = '7px';
		this.health_bar.style.backgroundColor = 'red';
		this.health_bar.style.opacity = 0.5;
		this.health_bar.style.filter = 'alpha(opacity=50)';
		this.inner_node = document.createElement('pre');
		this.node.appendChild(this.health_bar);
		this.node.appendChild(this.inner_node);
		this.container = container;
		this.__class = 'Monster';

		if (this.x <= 0) {
			this.x = Math.floor(Math.random() * this.container.offsetWidth);
		}

		if (this.y <= 0) {
			this.y = Math.floor(Math.random() * this.container.offsetHeight);
		}

		container.appendChild(this.node);
		
		this.step();
	} // init()

	
	this.hit = function(power) {
		var p = power || 1;

		this.hp -= p;
		if (this.hp <= 0) {
			this.dying = true;
			// this.dead = true;
		}

		/*
		var i = Math.max(0, 255 - Math.round(p * 200));
		this.node.style.border = '2px solid rgb(255,' + i + ',' + i + ')';
		var that = this.node;
		setTimeout(function() { that.style.border = '0px solid transparent'; }, 20);
		*/
	} // this.hit()
	
	
	this.step = function() {

		// move the monster randomly
		var vheading = this.heading / (Math.PI * 2);
		vheading += ((Math.random() * .25) - .125);
		vheading -= Math.floor(vheading);
		this.heading = vheading * Math.PI * 2;

		// this.x += Math.floor(Math.random() * this.level * 2) - this.level;
		this.x += Math.round(this.level * Math.cos(this.heading));
		this.x = Math.min(this.x, this.container.offsetWidth - this.node.offsetWidth/2 - 10);
		this.x = Math.max(this.x, 10 + this.node.offsetWidth/2);
		this.ex = this.x + this.node.offsetWidth/2;
		// this.cx = this.x + (this.node.offsetWidth/2);

		// this.y += Math.floor(Math.random() * this.level * 2) - this.level;
		this.y += Math.round(this.level * Math.sin(this.heading));
		this.y = Math.min(this.y, this.container.offsetHeight - this.node.offsetHeight/2 - 10);
		this.y = Math.max(this.y, 10 + this.node.offsetHeight/2);
		this.ey = this.y + this.node.offsetHeight/2;
		// this.cy = this.y + (this.node.offsetheight/2);

		if (this.container.grid) {
			// this.container.grid.consume(this.x, this.y, this.node.offsetHeight/2, Math.log(this.level)/Math.log(Math.PI));
			this.container.grid.consume(this.x, this.y, this.node.offsetHeight/2, this.level);
		}

	} // step()
	

	/*
	this.dieStep = function() {
		if (Math.random() > .5) {
			this.level = this.level - 2;
		}
		
		if (this.level <= 1) {
			this.dead = true;
		}
	}
	*/

	
	this.draw = function() {
		if (!container || !container.appendChild) {
			return;
		}
		
		// decrease level if the thing is dying
		if (this.dying) {
			this.level = this.level - 1;
			if (this.level <= 1) {
				this.dead = true;
			}
		}
		
		// is it dead?
		if (this.dead) {
			// this thing is dead.
			this.destroy();
			return;
		}
	
		this.innerDraw();

		var sx = this.x - (this.node.offsetWidth / 2);
		var sy = this.y - (this.node.offsetHeight / 2);

		this.node.style.left = sx + 'px';
		this.node.style.top = sy + 'px';

		var r = Math.round(255 * (1.0 - this.hp/this.initial_hp));
		this.node.style.color = 'rgb(' + r + ',0,0)';

		// this.health_bar.innerHTML = "<div style='position: absolute; background-color: red; height: 7px; width: " + Math.round(100 * this.hp/this.level) + "%; opacity: 0.5;'></div>";
		this.health_bar.style.width = Math.round(100 * this.hp/this.initial_hp) + '%';

	} // draw()


	this.innerDraw = function() {
		// temporary x, y, and distance
		var x, y, d;

		// effective size
		var es = Math.max(this.level, 2);
		
		// local center x and y
		var cx = es / 2;
		var cy = es / 2;
		
		// iterate through the CharacterArray
		this.ca = [];

		for (var i = 0; i < es * es; i++) {
			// determine x and y
			x = i % es;
			y = Math.floor(i / es);
			
			// distance to center;
			d = Math.sqrt(Math.abs(cx - x) * Math.abs(cx - x) + Math.abs(cy - y) * Math.abs(cy - y));
			
			this.ca.push(this.randomCharacter(1 - (d / (es / 2))));
		}

		var text = '';
		// text = "<div style='position: absolute; background-color: red; height: 7px; width: " + Math.round(100 * this.hp/this.level) + "%; opacity: 0.5;'></div>";
		for (var i = 0; i < this.ca.length; i++) {
			if (i % es == 0 && i != 0) {
				text += "<br />";
			}
			text += this.ca[i];
		}

		this.inner_node.innerHTML = text;
	} // innerDraw()
	
	
	this.randomCharacter = function(p) {
		var pc = p || 0.2;
		if (Math.random() <= p) {
			return String.fromCharCode(Math.floor(Math.random() * (126 - 64) + 64));
		} else {
			return "&nbsp;";
		}
	} // randomCharacter()


	this.destroy = function() {	
		this.g = null;
		this.container.removeChild(this.node);
		this.container = null;
	} // destroy()

	
	// go!
	this.init();
	
} // Monster()


var FramedMonster = function FramedMonster(level, container, x, y) {
	Monster.call(this, level, container, x, y);

	this.last_update = new Date(0);
	this.frame_counter = 0;
	this.frame_delay = 100;
	this.frames = ['X','O'];
	this.inner_node.style.fontSize = String(Number(level) + 9) + "px";
	this.inner_node.style.lineHeight = String(Number(level) + 6) + "px";
	this.__class = 'FramedMonster';

	this.innerDraw = function() {
		// only redraw every 1/10 second
		var n = new Date();
		if (n.getTime() < this.last_update.getTime() + this.frame_delay) {
			return;
		}

		this.last_update = n;

		// create text block to "draw" in
		var text = '';

		// add the health bar (unless i decide to keep this in draw() for consistency)
		// text = "<div style='position: absolute; background-color: red; height: 7px; width: " + Math.round(100 * this.hp/this.level) + "%; opacity: 0.5;'></div>";

		// draw the appropriate fame
		text += this.frames[this.frame_counter % this.frames.length];

		// update the drawing cycle
		this.frame_counter += 1;

		// put our drawing in this's DOM node
		this.inner_node.innerHTML = text;
	} // innerDraw()

} // FramedMonster()


var FrankinBlinker = function FrankinBlinker(level, container, x, y) {
	FramedMonster.call(this, level, container, x, y);
	this.frame_delay = 500 - (level * 15);
	this.__class = 'FrankinBlinker';

	this.frames = [
		// 1
		[
			' ///// ',
			'= o o =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 2
		[
			' ///// ',
			'= o o =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 3
		[
			' ///// ',
			'= o o =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 4
		[
			' ///// ',
			'= - - =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 5
		[
			' ///// ',
			'= o o =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 6
		[
			' ///// ',
			'= o o =',
			' | " | ',
			' | - | ',
			'  \\,/  '
		].join("\n"),

		// 7
		[
			' ///// ',
			'= > < =',
			' | " | ',
			' | o | ',
			'  \\,/  '
		].join("\n"),

		// 8
		[
			' ///// ',
			'= > < =',
			' | " | ',
			' | O | ',
			'  \\,/  '
		].join("\n"),

		// 9
		[
			' ///// ',
			'= > < =',
			' | " | ',
			' | o | ',
			'  \\,/  '
		].join("\n"),

		// 10
		[
			' ||||| ',
			'= o o =',
			' | " | ',
			' | ~ | ',
			'  \\,/  '
		].join("\n")

	];
} // FrankinBlinker()


var NomNom = function NomNom(level, container, x, y) {
	FramedMonster.call(this, level, container, x, y);
	this.frame_delay = 200 - (level * 15);
	this.__class = 'NomNom';

	this.frames = [
		[	'  %O  ',
			' O  - ',
			')    O',
			' O  * ',
			'  $@  '
		].join('\n'),

		[	'      ',
			' BO-O ',
			'O    A',
			' **Oo ',
			'      '
		].join('\n'),

		[	'      ',
			'      ',
			'98234s',
			'      ',
			'      '
		].join('\n'),

		[	'      ',
			' O356 ',
			'@    O',
			' @23O ',
			'      '
		].join('\n')
	];

} // NomNom()


var HeartMonster = function HeartMonster(level, container, x, y) {
	FramedMonster.call(this, level, container, x, y);
	this.frame_delay = 500 - (level * 15);
	this.__class = 'HeartMonster';

	this.inner_node.style.lineHeight = this.inner_node.style.fontSize;

	this.frames = [
		[
			' __  __',
			'/  \\/  \\',
			'\\      /',
			' \\    / ',
			'  \\  /  ',
			'   \\/   '
		].join("\n"),

		[
			'  _  _  ',
			' / \\/ \\ ',
			' \\    / ',
			'  \\  /  ',
			'   \\/   ',
			'        '
		].join("\n")

	];

	this.__destroy = this.destroy;
	this.destroy = function() {

		var t = this;
		var __r = function(c) {
			if (c == 'x') {
				var b = Number(t.x);
				var m = t.g.container.offsetWidth;
			} else {
				var b = Number(t.y);
				var m = t.g.container.offsetHeight;
			}

			var rv = b + Math.floor(Math.random() * 400) - 200;
			rv = Math.max(0, rv);
			rv = Math.min(m, rv);

			return rv;
		} // __coord()


		new GunShot(this.g, __r('x'), __r('y'), 150, 'rgb(0,150,0)', this.level * -10);
		new GunShot(this.g, __r('x'), __r('y'), 200, 'rgb(0,150,0)', this.level * -10);
		new GunShot(this.g, __r('x'), __r('y'), 250, 'rgb(0,150,0)', this.level * -10);
		new GunShot(this.g, this.x, this.y, 300, 'rgb(0,150,0)', this.level * -20);
		this.__destroy();
	} // this.destroy()

} // BombMonster


var Bomb = function BombMonster(level, container, x, y) {
	FramedMonster.call(this, level, container, x, y);
	this.frame_delay = 75;
	this.__class = 'Bomb';

	this.create_time = new Date();
	this.fuse_length = (Math.random() * 4500) + 1500;

	this.inner_node.style.lineHeight = this.inner_node.style.fontSize;

	this.frames = [
		[
			'    - ',
			'   /  ',
			' XXXX ',
			'XXXXXX',
			'XXXXXX',
			' XXXX '
		].join("\n"),

		[
			'    + ',
			'   /  ',
			' XXXX ',
			'XXXXXX',
			'XXXXXX',
			' XXXX '
		].join("\n")

	];


	this.__step = this.step;
	this.step = function() {
		var rightnow = new Date();
		if (rightnow.getTime() - this.create_time.getTime() > this.fuse_length) {
			this.explode();
			this.hp = 0;
			this.dead = true;
			this.dying = true;
		}

		this.__step();
	} // this.step()


	this.explode = function() {

		var t = this;
		var __r = function(c) {
			if (c == 'x') {
				var b = Number(t.x);
				var m = t.g.container.offsetWidth;
			} else {
				var b = Number(t.y);
				var m = t.g.container.offsetHeight;
			}

			var rv = b + Math.floor(Math.random() * 400) - 200;
			rv = Math.max(0, rv);
			rv = Math.min(m, rv);

			return rv;
		} // __coord()


		new GunShot(this.g, __r('x'), __r('y'), 150, 'rgb(200,0,0)', this.level);
		new GunShot(this.g, __r('x'), __r('y'), 200, 'rgb(200,0,0)', this.level);
		new GunShot(this.g, __r('x'), __r('y'), 250, 'rgb(200,0,0)', this.level);
		new GunShot(this.g, this.x, this.y, 300, 'rgb(200,0,0)', this.level * 10);
		this.destroy();

	} // this.explode()

} // Bomb()


var RandomMonster = function(level, game, x, y) {
	var i = Math.floor(Math.random() * RandomMonster.options.length);
	var m = new RandomMonster.options[i](level, game, x, y);
	return m;
} // RandomMonster()

RandomMonster.options = [Monster, NomNom, FramedMonster, FrankinBlinker, HeartMonster, Bomb];


var HUD = function(game, length, container) {
	// this.g = game;
	var L = length || 100;

	if (!container) {
		container = document.ascii_monster_container || document.body;
	}

	this.node = document.createElement('div');
	this.node.style.width = L + "px";
	this.node.style.height = L + "px";
	this.node.className = 'hud';
	this.container = container || document.body;

	document.onmouseup = function(e) {
		if (MainLoop.running()) {
			var event = e || window.event;
			var x = e.pageX || (e.clientX + document.body.scrollLeft);
			var y = e.pageY || (e.clientY + document.body.scrollTop);
			var t = new GunShot(game, x, y, 200);
		}
		return false;
	} // document.onmouseup()

	// this.node.onmouseup = function(e) { return false; }
	// this.node.onmousedown = function(e) { return false; }
	// this.node.onclick = function(e) { return false; }

	// add the node to the document
	document.body.hud = this;
	container.appendChild(this.node);
	// document.onmousemove = function(event) {
	this.draw = function() {
		var x = document.mouseX;
		var y = document.mouseY;

		// offset width/height should just be L
		var l = x - L/2;
		var t = y - L/2;

		l = Math.min(l, this.container.offsetWidth - L - 2);
		l = Math.max(l, 2);
		t = Math.min(t, this.container.offsetHeight - L - 2);
		t = Math.max(t, 2);

		this.node.style.left = l + 'px';
		this.node.style.top = t + 'px';
		this.node.innerHTML = x + ' X ' + y;
		// this.node.innerHTML = l + ' X ' + t;
		// this.node.innerHTML = this.container.offsetWidth + ' X ' + this.container.offsetHeight;
	} // draw()


	this.destroy = function() {
		document.onmouseup = null;
		document.body.hud = null;
		this.node.parentNode.removeChild(this.node);
	} // destroy()

} // HUD()


var GunShot = function(g, x, y, z, c, cd) {
	this.g = g;		// game
	this.x = x;		// shot location x
	this.y = y;		// shot location y
	this.z = z;		// shot demi-radius
	this.s = 0;		// current step
	this.m = 8;		// number of steps

	// shot color, if not given uses the game configuration
	this.c = c || g.c.shot_color;
	
	// collateral damage, if not given, uses the game configuration
	this.cd = cd || g.c.collateral_damage;

	this.shot = null;

	// shot will be registered as a monster (for now)
	this.dying = false;
	this.dead = false;

	// this.g.monsters.push(this);
	this.g.objects.push(this);

	this.draw = function() {
		// location of the shot
		var x = this.x;
		var y = this.y;

		// size of the O to draw, based on % complete (step#/maxsteps#)
		// times the shot power (z)
		var z = (this.s/this.m) * this.z;

		// color to draw the shot
		// var c = 'rgb(200,0,0)';

		// opacity is inversely proportional to the size of the shot
		var o = (1 - this.s/this.m) * .95 + .05;

		if (!this.shot) {
			this.shot = document.createElement('div');
			this.shot.style.border = '0px solid gray';
			this.shot.className = 'gunshot';
			this.shot.innerHTML = "<table style='width: 100%; height: 100%; margin: 0px; padding: 0px;'><tr><td style='text-align: center; vertical-align: middle; padding: 0px;'>O</td></tr></table>";
			// document.body.hud.container.appendChild(this.shot);
			this.g.container.appendChild(this.shot);
		}

		this.shot.style.left = String(x - z/2) + "px";
		this.shot.style.top = String(y - z/2) + "px";
		this.shot.style.width = z + 'px';
		this.shot.style.height = z + 'px';
		this.shot.style.fontSize = z + 'px';
		this.shot.style.color = this.c;
		this.shot.style.opacity = o;
		this.shot.style.filter = 'alpha(opacity=' + o * 100 + ')';
	} // this.draw()


	this.step = function() {
		if (this.dead) {
			return;
		}

		this.s += 1;
		if (this.s > this.m) {
			this.shot.parentNode.removeChild(this.shot);
			this.dead = true;
		} else {
			// adjusted radius
			var z = (this.s/this.m) * this.z;

			// adjusted damage and collateral damage
			var cd = (this.s/this.m) * this.cd;
			var hp = (this.s/this.m) * this.g.shot_power;

			// consume or heal some of the container, depending on
			// game configuration ...
			// this.g.container.consume(this.x, this.y, this.z * (this.s/this.m), this.cd);
			this.g.container.consume(this.x, this.y, z * 0.6, this.cd);

			// shot will have a dimishing hit value with each step
			var tm, dx, dy, d, p;
			for (var i = 0; i < this.g.monsters.length; i++) {
				tm = g.monsters[i];
				if (tm['hit'] && typeof(tm['hit']) == 'function') {
					dx = tm.x - this.x;
					dy = tm.y - this.y;
					d = Math.sqrt(dx*dx + dy*dy);
					if (d < z * 0.6) {
						tm.hit(hp);
					}
					// d = Math.max(0, Math.sqrt(dx * dx + dy * dy) - tm.node.offsetWidth/2);
					// d = Math.max(0, Math.sqrt(dx * dx + dy * dy) - 40);
					// p = Math.round(this.z/6.75 - d);
					// p = Math.round(this.z * 0.7 - d);
					// if (d <= (this.s/this.m) * this.z * 0.6) {
						// tm.hit(((this.m-this.s)/this.m) * 0.35);
					// }
				}
			}
		}
	}


	this.destroy = function() {
		if (this.shot) {
			this.g.container.removeChild(this.shot);
		}
	}

	// this.step();
} // GunShot()



var Container = function(config, parent_node) {
	var n = parent_node || document.body;
	var c = document.createElement('div');
	c.className = 'game_container';

	c.init = function() {
		this.grid = new DemoGrid(config);
		// c.grid.style.zIndex = 10;
		this.appendChild(this.grid);

		this.cover = document.createElement('div');
		this.cover.className = 'cover';
		this.appendChild(this.cover);
	} // init();


	c.consume = function(x, y, r, p) {
		this.grid.consume(x, y, r, p);
	} // consume()


	c.destroy = function() {
		this.parentNode.removeChild(this);
	} // destroy();


	c.reset = function() {
		this.removeChild(this.grid);
		this.removeChild(this.cover);
		this.destroy();
		this.init();
	} // reset()


	c.loadImage = function(d) {
		this.grid.loadImage(d);
	} // loadImage()


	// initialize container -- add grid and stuff
	c.init();

	// add the container to the DOM
	n.appendChild(c);


	return c;
} // Container()


// DemoGrid, as in *Demolition* Grid HTML
var DemoGrid = function(config) {
	var w = config.grid_width;
	var h = config.grid_height;

	var n = document.createElement('table');
	n.className = 'demo_grid';
	n.cell_hp = Math.floor(config.grid_hp/(w*h));
	n.hp = n.cell_hp*w*h;
	n.initial_hp = n.hp;
	n.cw = w;
	n.ch = h;

	n.src = config['background_image'] || 'big_giant.png';
	n.targetColor = new Color('#502800');

	n._cells = [];

	var ta;
	var tr;
	var td;
	for (var y = 0; y < h; y++) {
		ta = [];
		tr = document.createElement('tr');
		for (var x = 0; x < w; x++) {
			td = document.createElement('td');
			td.hp = n.cell_hp;
			td.startColor = config.background_fade_color;
			td.style.backgroundColor = td.startColor;
			ta.push(td);
			tr.appendChild(td);
		}
		n._cells.push(ta);
		n.appendChild(tr);
	}


	// create callback function for loading the grid image for this grid
	var cbfn = '__loadGridImage_' + (new Date()).getTime() + '_' + Math.random();
	window[cbfn] = function(d) {
		n.loadImage(d);
	}

	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = '/js-image-test.js?image=' + n.src + '&w=' + w + '&h=' + h + '&cb=g.container.grid.loadImage';
	document.body.appendChild(s);


	n.loadImage = function(d) {
		for (var y = 0; y < this.ch; y++) {
			for (var x = 0; x < this.cw; x++) {
				var c = new Color('#' + d.shift());
				c = c.getBlendedColor(config.background_fade_color, config.background_fade_amount);
				n._cells[y][x].startColor = c;
				n._cells[y][x].style.backgroundColor = c;
			}
		}
	} // n.loadImage()


	n.cellAt = function(x, y) {
		var px = this.offsetWidth;
		var py = this.offsetHeight;

		var cx = Math.floor((x/px) * this.cw);
		var cy = Math.floor((y/py) * this.ch);

		return this._cells[cy][cx];
	} // n.cellAt()


	n.cellsIn = function(x, y, r) {
		// pixel width and height of the grid
		var px = this.offsetWidth;
		var py = this.offsetHeight;

		// cell pixel width and height
		// ( this.cw|cy = width|height of grid in cells )
		var cpw = px / this.cw;
		var cph = py / this.ch;


		// leftmost grid coord
		var lt = Math.floor( ((x-r)/px) * this.cw );
		lt = Math.min(lt, this.cw - 1);
		lt = Math.max(lt, 0);

		// rightmost grid coord
		var rt = Math.floor( ((x+r)/px) * this.cw );
		rt = Math.min(rt, this.cw - 1);
		rt = Math.max(rt, 0);

		// topmost grid coord
		var tp = Math.floor( ((y-r)/py) * this.ch );
		tp = Math.min(tp, this.ch - 1);
		tp = Math.max(tp, 0);

		// bottommost grid coord
		var bm = Math.floor( ((y+r)/py) * this.ch );
		bm = Math.min(bm, this.ch - 1);
		bm = Math.max(bm, 0);


		// iterate through the grid coords.
		// calculate distance between px center coord and x,y coord.
		// if distance<r, add cell to return array.
		var tx, ty, dx, dy, d;
		var rv = [];
		for (var xi = lt; xi <= rt; xi++) {
			for (var yi = tp; yi <= bm; yi++) {
				tx = xi * cpw + cpw/2;
				ty = yi * cph + cph/2;
				dx = tx - x;
				dy = ty - y;
				d = Math.sqrt(dx * dx + dy * dy);

				// what was this supposed to accomplish??
				// d = Math.max(0, d - cph);

				// this._cells[yi][xi].temp_d = d;
				if (d <= r) {
					rv.push({cell: this._cells[yi][xi], distance: d});
				}
			}
		}
		
		return rv;
	} // n.cellsIn()


	n.consume = function(x, y, r, p) {
		var ta = this.cellsIn(x, y, r);
		for (var i = 0; i < ta.length; i++) {
			// keep track of the cell's initial value
			var prehp = ta[i].cell.hp;

			// determine new hp value for cell based on hit power and distance
			// var newhp = ta[i].cell.hp - p*(1-(ta[i].distance/r));
			var newhp = ta[i].cell.hp - p;
			newhp = Math.max(0, newhp);
			newhp = Math.min(this.cell_hp, newhp);
			ta[i].cell.hp = newhp;

			// update the HP value on the grid based on the actual change in HP,
			// but not to a value less than 0
			var dhp = prehp - ta[i].cell.hp;
			this.hp = Math.max(0, this.hp - dhp);

			// update coloration of the cell
			// var pct = 1 - (ta[i].cell.hp / 100);
			var m = 0.60;
			var pct = (m/-100.0) * ta[i].cell.hp + m;
			var c = ta[i].cell.startColor.getBlendedColor(this.targetColor, pct);
			ta[i].cell.style.backgroundColor = c.toHex();
		}
	}


	return n;
} // DemoGrid()


var ScoreIndicator = function(container, score) {
	var c = container || false;
	var s = score || 0;

	var n = document.createElement('div');
	n.className = 'score_indicator';

	n.setScore = function(score) {
		n.innerHTML = "Score: " + Number(score);
	} // setScore()

	n.reset = function() {
		n.setScore(0);
	} // reset()

	n.destroy = function() {
		n.parentNode.removeChild(n);
	} // destroy();

	n.setScore(s);

	if (c) {
		c.appendChild(n);
	}

	return n;
} // ScoreIndicator()


var HPIndicator = function(container, hp) {
	var c = container || false;
	var h = hp || 0;

	var n = document.createElement('div');
	n.className = 'hp_indicator';

	n.setHP = function(score) {
		n.innerHTML = "HP: " + Number(score);
	} // setScore()

	n.reset = function() {
		n.setHP(0);
	} // reset()

	n.destroy = function() {
		n.parentNode.removeChild(n);
	} // destroy()

	n.setHP(hp);

	if (c) {
		c.appendChild(n);
	}

	return n;
} // HPIndicator()


var LevelIndicator = function(container, level) {
	var c = container || false;
	var l = level || 1;

	var n = document.createElement('div');
	n.className = 'level_indicator';

	n.setLevel = function(level) {
		n.innerHTML = "Level: " + Number(level);
	} // n.setLevel()

	n.reset = function() {
		n.setLevel(1);
	} // reset()

	n.destroy = function() {
		n.parentNode.removeChild(n);
	} // destroy()

	n.setLevel(l);

	if (c) {
		c.appendChild(n);
	}

	return n;
} // LevelIndicator()


var LevelRoundup = function(game) {
	var title = "Wave <span style='color: red;'>" + Number(game.level - 1) + "</span> destroyed.";
	var left_side = [
		new PropertyList({ 
			"Monsters Destroyed": game.kills,
			"Level Bonus": game.level_bonus,
			"HP Remaining": Math.floor(game.container.grid.hp),
			"Overall Score": '<b>' + game.score + '</b>'
		}).toHTML()
	].join("\n");
	var right_side = "";
	var close_text = "Bring on wave " + game.level;
	new InfoBox(game, title, left_side, right_side, close_text, false);
} // LevelRoundup()


var GameOverSummary = function(game) {
	var title = "Game Over.";
	var left_side = [
		new PropertyList({
			"Level Reached": game.level,
			"Monsters Destroyed": game.kills,
			"Overall Score": '<b>' + game.score + '</b>'
		}).toHTML()
	].join("\n");

	var right_side = "";
	if (game['__awards_given'] || !TPDC['authenticatedUser']) {
		right_side += "You have collected some drops.<br />You must <a href='/signin'>sign in</a> to use them.";
	}

	right_side += "<div>" + FacebookShareButton() + "</div>";
	var close_text = "Start over.";
	new InfoBox(game, title, left_side, right_side, close_text, true);
} // GameOverSummary()


var InfoBox = function(game, title, left_side, right_side, close_text, new_game) {
	this.game = game;
	this.new_game = new_game;

	this.backdrop = document.createElement('div');
	this.backdrop.className = 'roundup_backdrop';
	game.container.appendChild(this.backdrop);

	this.infobox = document.createElement('div');
	this.infobox.className = 'roundup_infobox';
	this.infobox.innerHTML = "<h2 style='text-decoration: underline;'>" + title + "</h2>";

	var t = document.createElement('table');
	t.className = 'container_table';
	this.infobox.appendChild(t);

	var tr = document.createElement('tr');
	t.appendChild(tr);

	var td = document.createElement('td');
	tr.appendChild(td);
	td.innerHTML = left_side;

	var td2 = document.createElement('td');
	tr.appendChild(td2);
	td2.innerHTML = right_side;

	var d = document.createElement('div');
	d.style.marginTop = '30px';
	td2.appendChild(d);

	var link = document.createElement('a');
	var that = this;
	link.style.fontSize = '14pt';
	link.innerHTML = close_text;
	link.href = '#';
	this.infobox.appendChild(link);
	link.onmouseup = function() { that.close(); };
	d.appendChild(link);

	var e = document.createElement('a');
	e.style.color = 'gray';
	e.innerHTML = 'These monsters are scary. I want to leave ...';
	e.href = '/';
	this.infobox.appendChild(e);

	this.close = function() {
		this.backdrop.parentNode.removeChild(this.backdrop);
		this.infobox.parentNode.removeChild(this.infobox);
		if (this.new_game) {
			this.game.reset();
		}
		this.game.start();
	} // close()

	game.container.appendChild(this.infobox);

} // InfoBox()


var Notification = function(game, title, description) {
	return new TPDC.Notification(title, description, game.achievements_node);
} // Notification()


var FacebookShareButton = function() {
	return "<div style='margin-top: 20px;'><a href='javascript:FBPublish();' class='facebook'><span>Flaunt your success!</span></a></div>";
} // FacebookShareButton()


var FBPublish = function() {
	TPDC.FacebookPublish({
		name: "Onoz! ASCII Monsters!",
		properties: {
			"Level Reached": g.level,
			"Monsters Defeated": g.kills,
			"Overall Score": g.score
		},
		actions: [
			{name: "Shoot some monsters", link: "<?php print $base_url; ?>ascii-monsters"}
		]
	});
} // FBPublish()


var Game = function(override_c) {
	// default configuration
	this.c = {
		// starting level
		level: 1,

		// starting kill count
		kills: 0,

		// starting score
		score: 0,

		// a function that returns the number of monsters to create based
		// on the given level
		monster_count: function(level) {
			level = Number(level);
			return Math.min(1 + Math.floor((Math.sin(level) + level)), 16);
		},

		// function must return a monster level based on the given game level
		// and monster-number (i)
		monster_level: function(level, i) {
			level = Number(level);
			i = Number(i);
			return 1 + level + Math.floor(Math.cos(i*1.5)*1.25);
		},

		// base HP assigned to the monster, based on level.
		// monsters subclasses may override this.
		monster_hp: function(level) {
			return level*(Math.log(level)/Math.log(Math.PI));
		},

		// base power used to consume the grid, based on level.
		// monster subclasses may override this.
		monster_power: function(level) {
			// return Math.log(level)/Math.log(Math.PI);
			return Math.log(level)/Math.log(Math.PI);
		},

		// function must return points awarded for killing the provided monster
		monster_kill_points: function(m) {
			return m.initial_level * m.initial_level;
		},

		// default monster coords
		monster_x: -1,
		monster_y: -1,

		// hud size in pixels
		hud_size: 50,

		// shot color
		shot_color: new Color(200, 0, 0),

		// base amount of damage shots inflict on monsters
		shot_power: 0.35,
 
		// base amount of damage shots inflict on the grid
		collateral_damage: 0.35,

		// image to load onto the grid as a background mosaic
		background_image: 'big_giant.png',

		// set color and fade amount to blend background with by default
		background_fade_color: new Color('#ffffff'),
		background_fade_amount: 0.25,

		// width and height of demolition grid in cells
		grid_width: 32,
		grid_height: 24,

		// rough starting HP for grid
		grid_hp: 50000,

		// step/frame-rate
		fps: 25,

		// chance for new spawn every second
		spawn_rate: 0.1,

		// array of functions to run AFTER other step()/draw() logic
		// functions will be passed a game object.
		plugins: [],

		// kill triggers, called immediately after a monster dies
		kill_triggers: [],

		ranks: [
			'Noob',
			'Novice',
			'Half Wit',
			'Three Quarter Wit',
			'Joe',
			'Legendary Joe',
			'Grand Legendary Joe',
			'Grand Legendary Joe, The Wit',
			'Warrior',
			'Crazed Warrior',
			'Postal Worker',
			'Cuddly Bunny',
			'Angry Bunny'
		]
		
	};

	// override values in c as necessary
	if (override_c && typeof(override_c) == 'object') {
		for (var i in this.c) {
			if (override_c[i]) {
				this.c[i] = override_c[i];
			}
		}
	}

	// start tracking mouse movement - store the most recent mouse
	// positions on the document
	document.onmousemove = function(event) {
		var e = event || window.event;
		var x, y;
		if (e.pageX || e.pageY) {
			x = e.pageX;
			y = e.pageY;
		} else if (e.clientX || e.clientY) {
			x = e.clientX + document.body.scrollLeft;
			y = e.clientY + document.body.scrollTop;
		}
		document.mouseX = x;
		document.mouseY = y;
	}


	this.initGameValues = function() {
		// game elements
		this.container = null;
		this.level_indicator = null;
		this.score_indicator = null;
		this.hp_indicator = null;
		this.notifications = null;
		this.hud = null;	// new HUD(this.c.hud_size);
		this.monsters = [];
		this.objects = [];

		// resetable items
		this.kills = this.c.kills;
		this.level = this.c.level;
		this.score = this.c.score;
		this.level_bonus = 0;
		this.monster_i = 0;
		this.frame = 0;
		this.paused = false;
		this.achievements = [];
		this.achievements_node = null;
		this.rank = 0;

		// placeholder for misc. "general" or plugin values and objects
		// that must be non-existent at start and reset
		this.general = {};
	} // initGameValues()

	this.initGameValues();


	this.reset = function() {
		// clear out node-ish objects
		this.container.destroy();
		this.level_indicator.destroy();
		this.score_indicator.destroy();
		this.hp_indicator.destroy();
		// this.notifications.destroy();
		this.hud.destroy();

		// clear out monster and object nodes
		var m, o;

		while (m = this.monsters.pop()) {
			if (m && m.destroy && typeof(m.destroy) == 'function') {
				m.destroy();
			}
		}

		while (o = this.objects.pop()) {
			if (o && o.destroy && typeof(o.destroy) == 'function') {
				o.destroy();
			}
		}

		// and then reset all resetables
		this.initGameValues();

	} // this.reset()


	this.addKill = function() {
		this.kills += 1;
	} // addKill()


	this.addToScore = function(s) {
		this.score += s;
		this.score_indicator.setScore(this.score);
	} // addToScore()


	this.achieve = function(title, description) {
		var n = new Notification(this, title, description);
		this.achievements.push(n);
	} // achieve()


	this.endLevel = function() {
		this.pause();
		this.level_bonus = Math.floor((this.container.grid.hp/20000) * Math.pow(2, this.level)) + (this.level * 100);
		this.score += this.level_bonus;
		this.level += 1;
		// this.level_bonus = "(" + Math.floor(this.container.grid.hp) + "/10000) X 10<sup>" + this.level + "</sup> = <span style='color: red;'>" + level_bonus_value + "</span>";

		this.level_indicator.setLevel(this.level);
		this.score_indicator.setScore(this.score);
		this.roundEnd = new Date();
		new LevelRoundup(this);
	} // endLevel()


	this.endGame = function() {
		this.pause();
		new GameOverSummary(this);
	} // endGame()


	this.start = function() {

		document.onmousedown = function(e) { return false; }
		document.onclick = function(e) { return false; }

		if (!this.container) {
			this.container = new Container(this.c, null);
			this.level_indicator = new LevelIndicator(this.container);
			this.level_indicator.setLevel(this.level);
			this.score_indicator = new ScoreIndicator(this.container);
			this.score_indicator.setScore(0);
			this.hp_indicator = new HPIndicator(this.container);
			this.hp_indicator.setHP(this.container.grid.hp);
			this.achievements_node = document.createElement('div');
			this.achievements_node.className = 'achievements';
			this.hud = new HUD(this, this.c.hud_size, this.container);
			this.container.appendChild(this.achievements_node);
			
			var t = document.getElementById('__stats');
			this.container.appendChild(t);
		}

		if (this.monsters.length == 0) {
			// populate monsters
			var monster_qty = this.c.monster_count(this.level);
			for (var i = 0; i < monster_qty; i++) {
				l = this.c.monster_level(this.level, i);
				this.monsters.push(RandomMonster(l, this));
			}

			this.monster_i = monster_qty;
		}

		var that = this;
		// this.mainloop = setInterval(function() { MainLoop(that); }, 1000 / this.c.fps);
		MainLoop.start(that);
		this.paused = false;
		this.roundStart = new Date();
		this.roundEnd = null;
	} // start()


	this.pause = function() {
		this.paused = true;
		// this.mainloop = clearInterval(this.mainloop);
		MainLoop.stop();
		document.onmousedown = function(e) { return true; }
		document.onclick = function(e) { return true; }
	} // pause()


} // Game()


// the MainLoop will be called on an interval based on the
// FPS designated in the game config.
var MainLoop = function() {
	var g = MainLoop.game;
	var m = g.monsters;
	var o = g.objects;


	// MONSTERS

	// remove dead monsters
	for (var i = 0; i < m.length; i++) {
		if (m[i].dead) {
			// g.addToScore(m[i].initial_level);
			g.addToScore(g.c.monster_kill_points(m[i]));
			g.addKill();

			// change level back to initial level for triggers.
			m[i].level = m[i].initial_level;
			for (var ii = 0; ii < g.c.kill_triggers.length; ii++) {
				g.c.kill_triggers[ii](g, m[i]);
			}

			m.splice(i, 1);
			i -= 1;
		}
	}

	// conditionally spawn new monsters
	if (m.length > 0 && g.frame > 0 && g.frame % g.c.fps == 0) {
		if (Math.random() <= g.c.spawn_rate) {
			g.monster_i += 1;
			var l = g.c.monster_level(g.level, g.monster_i);
			g.monsters.push(new RandomMonster(g.level, g));
		}
	}

	// increment frame counter
	g.frame += 1;


	// END LEVEL/GAME CONDITIONS

	// end-of-level: all monsters killed
	if (m.length == 0 && o.length == 0) {
		g.endLevel();
	}

	// end-of-game: page completely consumed
	g.hp_indicator.setHP(Math.floor(g.container.grid.hp));
	if (Math.floor(g.container.grid.hp) <= 0) {
		g.endGame();
	}

	// step loop
	for (var i = 0; i < m.length; i++) {
		m[i].step();
	}
	
	// draw loop
	for (var i = 0; i < m.length; i++) {
		m[i].draw();
	}


	// MISC OBJECTS

	// remove "dead" objects
	for (var i = 0; i < o.length; i++) {
		if (o[i].dead) {
			o.splice(i, 1);
		}
	}

	// step loop
	for (var i = 0; i < o.length; i++) {
		o[i].step();
	}
	
	// draw loop
	for (var i = 0; i < o.length; i++) {
		o[i].draw();
	}

	
	// run post-step functions
	for (var i = 0; i < g.c.plugins.length; i++) {
		if (typeof(g.c.plugins[i]) == 'function') {
			g.c.plugins[i](g);
		}
	}

	// HUD
	g.hud.draw();

} // MainLoop()
MainLoop.game = {};
MainLoop.__running = false;

MainLoop.start = function(g) {
	MainLoop.game = g;
	TPDC.MainLoop.start(g.c.fps);
	TPDC.MainLoop.addFunction(MainLoop);
	MainLoop.__running = true;
} // MainLoop.start()

MainLoop.stop = function() {
	TPDC.MainLoop.removeFunction(MainLoop);
	MainLoop.__running = false;
} // MainLoop.stop()

MainLoop.running = function() {
	return MainLoop.__running;
} // MainLoop.running()
