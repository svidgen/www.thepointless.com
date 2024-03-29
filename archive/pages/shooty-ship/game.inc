<?php

$meta_title = 'shooty ship - thepointless.com';
$require_theme = 'basic';
$manifest = 'manifest.json';

?>

<style type='text/css'>
	@import url(sheet.css?v=<?php print $general_version; ?>);

	html, body, #content {
		width: 100%;
		height: 100%;
		margin: 0px;
		padding: 0px;
		position: relative;
	}
</style>

<ss:board></ss:board>

<script type='text/javascript' src='/ajax/api?v=<?php print $general_version; ?>'></script>
<script type='text/javascript' src='/js/tpdc.js?v=<?php print $general_version; ?>'></script>
<script type='text/javascript'>

if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('sw.js');
};

var SS = SS || {};


SS.Board = function() {
	var _t = this;

	this.enabled = false;

	this.minX = 0;
	this.maxX = 100;
	this.minY = 0;
	this.maxY = 100;

	this.enable = function() {
		if (!this.enabled) {
			this.enabled = true;
			TPDC.MainLoop.addObject(_t);
		}
	}; // enable();

	this.disable = function() {
		this.enabled = false;
	}; // disable()

	this.resize = function() {
		this.style.width = '100%';
		this.style.height = '100%';
		this.style.top = '';
		this.style.left = '';
		this.minX = 0;
		this.maxX = 100;
		this.minY = 0;
		this.maxY = 100;

		var box = new TG.NodeBox(this);

		// make square
		var max = Math.max(box.width, box.height);
		var min = Math.min(box.width, box.height);
		var correction = 100 * max/min;
		var offset = (correction - 100)/2;
		var comp = 100 * offset/correction;
		if (box.width == max) {
			this.style.height = correction + '%';
			this.style.top = -1 * offset + '%';
			this.minY = comp;
			this.maxY = 100 - comp;
		} else {
			this.style.width = correction + '%';
			this.style.left = -1 * offset + '%';
			this.minX = comp;
			this.maxX = 100 - comp;
		}

	}; // resize()


	this.getSpawnPoint = function() {
		var x, y;
		if (Math.random() < 0.5) {
			x = Math.random() < 0.5 ? this.minX : this.maxX;
			y = Math.random() * this.maxY;
		} else {
			y = Math.random() < 0.5 ? this.minY : this.maxY;
			x = Math.random() * this.maxX;
		}
		return {x: x, y: y};
	}; // getSpawnPoint()


	this.step = function() {
		if (!this.enabled) { return; }
	
		if (this.rocks < this.maxRocks) {
			var spawn = this.getSpawnPoint();
			var target = {
				x: this.ship.x + (Math.random() * 20 - 10),
				y: this.ship.y + (Math.random() * 20 - 10)
			};

			// heading
			var rise = target.y - spawn.y;
			var run = target.x - spawn.x;
			var d = Math.atan2(rise, run);

			var enemy = New(SS.Enemy, {
				x: spawn.x, y: spawn.y, direction: d,
				speed: 0.2 + (Math.random() * _t.maxRocks / 3.3),
				game: _t
			});

			on(enemy, 'shot', function() {
				_t.score += 1;
				_t.maxRocks = Math.log(_t.score)/Math.log(Math.E) || 1;
			});

			on(enemy, 'destroy', function() {
				_t.rocks -= 1;
				TPDC.award(1, 'Paper Rock');
			});

			this.appendChild(enemy);
			this.rocks++;
		}
	}; // step()

	this.draw = function() {
	}; // draw()

	this.gameover = function() {
		this.disable();
		this.returnEvents();
		setTimeout(function() {
			var splash = New(SS.GameOverSplash, {
				board: _t,
				score: _t.score,
			});
			on(splash, 'restartClick', function() { _t.start(); });
			_t.appendChild(splash);
		}, 2000);
	}; // gameover()

	this.start = function() {
		var rocks = getNodes(this, SS.Enemy);
		for (var i = 0; i < rocks.length; i++) {
			rocks[i].explode('');
		}

		this.score = 0;
		this.rocks = 0;
		this.maxRocks = 1;

		this.enable();
		this.ship.respawn();
		this.ship.leapTo(50 - _t.ship.width/2, 50 - _t.ship.height/2);

		this.stealEvents();
	}; // restart()

	this.interact = function(e) {
		if (!this.enabled) { return; }

		var mc = new TG.MouseCoords(e);
		var tc = new TG.NodeBox(this);
		var destination = {
			x: 100 * (mc.x - tc.x)/tc.width,
			y: 100 * (mc.y - tc.y)/tc.height
		};
		this.ship.pushTo(destination);

		return false;
	}; // interact()

	var eventProxy = function(o, fn) {
		return function(e) {
			var evt = e || window.event;
			if (evt.type.match(/touch/)) {
				o.onmousedown = null;
				o.onmousemove = null;
				o.onmouseup = null;
			}
			var rv = fn(evt);
			if (!rv && typeof(evt.preventDefault) == 'function') {
				evt.preventDefault();
			}
			return rv;
		};
	}; // eventProxy()

	this.stealEvents = function() {
		this.ontouchstart = eventProxy(_t, function(e) { _t.interact(e); });
		this.ontouchmove = function() { return false; }
		this.ontouchend = function() { return false; }
		this.ontouchleave  = function() { return false; }
		this.ontouchcancel = function() { return false; }
		this.onmousedown = eventProxy(_t, function(e) { _t.interact(e); });
		this.onclick = function() { return false; }
		this.onmouseup = function() { return false; }
	}; // stealEvents()

	this.returnEvents = function() {
		this.ontouchstart = null;
		this.ontouchmove = null;
		this.ontouchend = null;
		this.ontouchleave = null;
		this.ontouchcancel = null;
		this.onmousedown = null;
		this.onclick = null;
		this.onmouseup = null;
	}; // returnEvents()

	on(_t.presplash, 'restartClick', function() { _t.start(); });

	on(_t.ship, 'shoot', function(bullet) {
		_t.appendChild(bullet);
	});

	on(_t.ship, 'destroy', function() {
		_t.gameover();
	});

	this.resize();
	window.onresize = function() {
		_t.resize();
	}; // window.onresize()

	setType(this, 'SS.Board');
	onready(this).fire();
}; // Board
SS.Board.templateMarkup = "\
<ss:gameoversplash data-id='presplash' heading='Shooty Ship'></ss:gameoversplash>\
<ss:ship data-id='ship' style='top: -100%; left: -100%;'></ss:ship>";
Bind(SS.Board, 'ss:board');


SS.Audio = {
	audiocontext: null,
	channels : {},
	play : function(src) {
		var c = this.channels;
		if (typeof(c[src]) == 'undefined') {
			this.prepare(src);
		} else {
			c[src].play();
		}
	},
	prepare : function(src) {
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		if (AudioContext) {
			var _t = this;
			_t.context = _t.context || new AudioContext();
			var player = {
				buffer: null,
				play: function() {
					if (this.buffer) {
						var source = _t.context.createBufferSource();
						source.buffer = this.buffer;
						source.connect(_t.context.destination);
						source.start ? source.start(0) : source.noteOn(0);
					}
				} // play
			};
			var r = new XMLHttpRequest();
			r.open('GET', src, true);
			r.responseType = 'arraybuffer';
			r.onload = function() {
				_t.context.decodeAudioData(r.response, function(buffer) {
					player.buffer = buffer;
				});
			};
			r.send();
			this.channels[src] = player;
		} else {
			var a = new Audio();
			a.autoplay = false;
			a.repeat = false;
			a.preload = true;
			a.src = src;
			a.load();
			this.channels[src] = {
				play: function() {
					a.pause();
					a.currentTime = 0;
					a.play();
				}
			};
		}
	}
}; // Audio()


SS.Button = function() {
	this.onclick = function() {
		on(this, 'click').fire();
		return false;
	}; // onclick()
	this.ontouchend = this.onclick;
	setType(this, 'SS.Button');
}; // Button


SS.StartButton = function() {
	SS.Button.apply(this);
	setType(this, 'SS.StartButton');
}; // StartButton
SS.StartButton.templateMarkup = "Start";
Bind(SS.StartButton, 'ss:startbutton');


SS.MagicallySizedObject = function() {
	var coords = new TG.NodeBox(this);
	var pCoords = new TG.NodeBox(this.parentNode || document.body);

	this.width = 100 * coords.width / pCoords.width;
	this.height = 100 * coords.height / pCoords.height;

	setType(this, 'SS.MagicallySizedObject');
}; // MagicallySizedObject()


SS.Ship = function() {
	var _t = this;

	this.x = this.x || 0;
	this.y = this.y || 0;

	SS.MagicallySizedObject.apply(this);

	this.direction = this.direction || Math.PI/-2; 
	this.target = {x: _t.x, y: _t.y, direction: _t.direction};

	this.enabled = false;

	this.enable = function() {
		if (!this.enabled) {
			TPDC.MainLoop.addObject(this);
			this.enabled = true;
		}
	}; // enable()

	this.disable = function() {
		if (this.enabled) {
			TPDC.MainLoop.removeObject(this);
			this.enabled = false;
		}
	}; // disable();

	this.leapTo = function(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction || Math.PI/-2;
		this.target = {x: _t.x, y: _t.y, direction: _t.direction};
	}; // leapTo()

	this.step = function() {
		var t = this.target.direction;
		var c = this.direction;
		this.direction = this.direction + Math.atan2(
			Math.sin(this.target.direction - this.direction),
			Math.cos(this.target.direction - this.direction)
		) / 4;

		this.x = this.x + (this.target.x - this.x) / 12;
		this.y = this.y + (this.target.y - this.y) / 12;
	}; // step()

	this.draw = function() {
		var d = Number(this.direction) + (Math.PI/2);
		this.style.transform = 'rotate(' + d + 'rad)';
		this.style.webkitTransform = 'rotate(' + d + 'rad)';
		this.style.mozTransform = 'rotate(' + d + 'rad)';
		this.style.msTransform = 'rotate(' + d + 'rad)';
		this.style.left = this.x + '%';
		this.style.top = this.y + '%';
	}; // draw();

	this.destroy = function() {
		if (this.dead || this.disabled) { return; }

		this.dead = true;
		this.disable();

		var pn = this.parentNode;
		var x = this.x;
		var y = this.y;
		var w = this.width;
		var h = this.height;
		for (var i = 0; i < 8; i++) {
			setTimeout(function() {
				pn.appendChild(
					New(SS.Explosion, {
						x: x + (Math.random() * 10) - 5,
						y: y + (Math.random() * 10) - 5,
						duration: i * 100
					})
				);
			}, i * 100);
		}

		on(this, 'destroy').fire();
		this.style.display = 'none';
	}; // destroy()

	this.respawn = function() {
		this.dead = false;
		this.style.display = '';
		this.enable();
	}; // respawn ()

	this.pushTo = function(coords) {
		if (this.dead) { return false; }

		this.shoot();

		this.target.x = coords.x - this.width/2;
		this.target.y = coords.y - this.height/2;

		var rise = this.target.y - this.y;
		var run = this.target.x - this.x;
		this.target.direction = Math.atan2(rise, run);
	}; // pushTo()

	this.shoot = function() {
		var bullet = New(SS.Bullet, {
			x: _t.x + this.width/2,
			y: _t.y + this.height/2,
			direction: _t.direction
		});
		on(this, 'shoot').fire(bullet);
	}; // shoot()

	on(this, 'collide', function(o) {
		if(isa(o, 'SS.Enemy')) {
			_t.destroy();
		}
	});

	setType(this, 'SS.Ship');
	onready(this).fire();
}; // Ship
SS.Ship.templateMarkup = "";
Bind(SS.Ship, 'ss:ship');


SS.Projectile = function() {
	var _t = this;

	this.x = Number(this.x || 0);
	this.y = Number(this.y || 0);
	this.width = Number(this.width || 1);
	this.height = Number(this.height || 1);

	this.ix = this.x;
	this.iy = this.y;

	this.direction = this.direction || 0;
	this.speed = this.speed || 2.5;
	this.range = this.range || 130;
	this.dead = false;

	this.conflicts = this.conflicts || [];

	this.destroy = function() {
		on(this, 'destroy').fire();
		this.dead = true;
		this.parentNode ? this.parentNode.removeChild(this) : 1;
	}; // destroy()

	this.step = function() {
		var dx = this.x - this.ix;
		var dy = this.y - this.iy;
		var travelled = Math.sqrt(dx * dx + dy * dy);
		if (travelled >= this.range) {
			this.destroy();
		} else {
			this.x += Math.cos(this.direction) * this.speed;
			this.y += Math.sin(this.direction) * this.speed;
			this.findCollisions();
		}
	}; // step()

	this.draw = function() {
		this.style.top = this.y - this.height/2 + '%';
		this.style.left = this.x - this.width/2 + '%'; 
	}; // draw()

	this.findCollisions = function() {
		for (var i = 0; i < this.conflicts.length; i++) {
			this.findCollisionsWith(this.conflicts[i]);
		}
	}; // findCollisions()

	this.findCollisionsWith = function(search) {
		var box = new TG.NodeBox(this);
		var nodes = getNodes(document, search);
		for (var i = 0; i < nodes.length; i++) {
			if (box.overlaps(new TG.NodeBox(nodes[i]))) {
				on(this, 'collide').fire(nodes[i]);
				on(nodes[i], 'collide').fire(this);
			}
		}
	}; // findCollisionsWith()


	setType(this, 'SS.Projectile');
}; // Projectile


SS.Bullet = function() {
	var _t = this;

	this.speed = this.speed || 2;
	this.conflicts = [SS.Enemy];

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Enemy')) {
			_t.destroy();
		}
	});

	SS.Audio.play(SS.Bullet.sound);

	SS.Projectile.apply(this);
	setType(this, 'SS.Bullet');
	TPDC.MainLoop.addObject(this);
	onready(this).fire();

}; // Bullet
SS.Bullet.sound = "/images/pew-128.mp3";
SS.Audio.prepare(SS.Bullet.sound);
SS.Bullet.templateMarkup = " ";
Bind(SS.Bullet, 'ss:bullet');


SS.Enemy = function() {
	SS.Projectile.apply(this);
	var _t = this;

	this.speed = this.speed || 1;
	this.width = 11.7;
	this.height = 11.7;

	this.visibleDirection = this.visibleDirection || 0;
	this.rotationSpeed = Math.random() * 0.4 - 0.2;

	this.conflicts = [SS.Ship];

	this._step = this.step;
	this.step = function() {
		this.visibleDirection = this.visibleDirection + this.rotationSpeed;
		this._step();
	}; // step()

	this._draw = this.draw;
	this.draw = function() {
		var d = Number(this.visibleDirection) + (Math.PI/2);
		this.style.transform = 'rotate(' + d + 'rad)';
		this.style.webkitTransform = 'rotate(' + d + 'rad)';
		this.style.mozTransform = 'rotate(' + d + 'rad)';
		this.style.msTransform = 'rotate(' + d + 'rad)';
		this._draw();
	}; // draw()

	this.explode = function(v) {
		on(_t, 'shot').fire();
		_t.parentNode.appendChild(New(SS.Explosion, {
			x: _t.x,
			y: _t.y,
			text: v === undefined ? _t.game.score : v
		}));
		_t.destroy();
	}; // explode()

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Bullet')) { _t.explode(); }
	});

	setType(this, 'SS.Enemy');
	TPDC.MainLoop.addObject(this);
	onready(this).fire();
}; // Enemy
SS.Enemy.templateMarkup = "";
Bind(SS.Enemy, 'ss:enemy');


SS.Explosion = function() {

	this.dead = false;
	this.duration = this.duration || 500;
	this.radius = this.radius || 15;
	this.startTime = new Date();
	this.x = this.x || 50;
	this.y = this.y || 50;

	this.pct = 0;

	this.destroy = function() {
		this.dead = true;
		this.parentNode.removeChild(this);
		on(this, 'destroy').fire();
	}; // destroy()

	this.step = function() {
		var now = new Date();
		this.pct = Math.min(1, (now.getTime() - this.startTime.getTime())/this.duration);
		if (this.pct > 0.98) {
			this.destroy();
		}
	}; // step()

	this.draw = function() {
		var c = this.pct * this.radius;
		this.style.width = c + '%';
		this.style.height = this.offsetWidth - 30 + 'px';
		this.style.left = this.x - c/2 + '%';
		this.style.top = this.y - c/2 + '%';
		this.style.opacity = 1 - this.pct;
		this.style.filter = "alpha(opacity=" + (1 - this.pct) * 100 + ")";
		this.style.fontSize = this.offsetWidth * 0.5 + 'px';
	}; // draw()

	setType(this, 'SS.Explosion');
	TPDC.MainLoop.addObject(this);
	SS.Audio.play(SS.Explosion.sound);
	onready(this).fire();
}; // Explosion
SS.Explosion.sound = '/images/pkewh.mp3';
SS.Audio.prepare(SS.Explosion.sound);
SS.Explosion.templateMarkup =
	"<table><tr><td data-id='text'></td></tr></table>";
Bind(SS.Explosion, 'ss:explosion');


SS.GameOverSplash = function() {
	var _t = this;

	this.delay = this.delay || 1000;

	var score = parseInt(this.score.innerHTML) || 0;

	if (score == 0) {
		this.share.parentNode.removeChild(this.share);
	}

	var max = 0;
	if (localStorage) {
		max = parseInt(localStorage.getItem('highscore'));
		if (!max || max === Math.NaN || max < score) {
			max = score;
			localStorage.setItem('highscore', max);
		}
		this.maxScore.innerHTML = max;
	} else {
		this.maxScoreLine.parentNode.removeChild(this.maxScoreLine);
	}

	onready(this.share, function() {
		_t.share.setScores(score, max);
	});

	on(_t.restart, 'click', function() {
		on(_t, 'restartClick').fire();
		_t.parentNode.removeChild(_t);
	});

	setTimeout(function() {
		TG.addClassname(_t, 'visible');
	}, this.delay);

	setType(this, 'SS.GameOverSplash');
	onready(this).fire();
}; // GameOverSplash()
SS.GameOverSplash.templateMarkup = "\
	<div class='background'></div>\
	<ss:bannerad></ss:bannerad>\
	<div class='foreground'>\
		<h1 data-id='heading'>Game Over</h1>\
		<div class='scoreline'>Your score: <span data-id='score' class='score'>...?</span></div>\
		<div data-id='maxScoreLine' class='max-scoreline'>Your best: <span data-id='maxScore' class='score'>...?</span></div>\
		<ss:startbutton data-id='restart'>Restart</ss:startbutton>\
		<ss:sharebutton data-id='share'></ss:sharebutton>\
	</div>\
";
Bind(SS.GameOverSplash, 'ss:gameoversplash');


SS.BannerAd = function() {
	setTimeout(function() {
		(adsbygoogle = window.adsbygoogle || []).push({});
	}, 250);
}; // BannerAd
SS.BannerAd.templateMarkup = "\
<!-- Shooty Ship Responsive -->\
<ins class=\"adsbygoogle\"\
     style=\"display:block\"\
     data-ad-client=\"ca-pub-6115341109827821\"\
     data-ad-slot=\"6469936332\"\
     data-ad-format=\"auto\"></ins>\
";
Bind(SS.BannerAd, 'ss:bannerad');

</script>

<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</script>
