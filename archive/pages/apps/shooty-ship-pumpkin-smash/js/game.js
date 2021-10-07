var SS = SS || {};

var HIGHSCORE_KEY = 'shooty-ship-pumpkin-smash.highscore';

var trackEvent = function(action, o_label, o_value, o_noninteraction) {
	gtag('event', action, {
		'event_category': 'game',
		'event_label': o_label,
		'value': o_value,
		'non_interaction': o_noninteraction
	});
};


SS.Board = function() {
	var _t = this;

	this.enabled = false;

	this.minX = 0;
	this.maxX = 100;
	this.minY = 0;
	this.maxY = 100;

	this.enemies = [];

	this.enable = function() {
		if (!this.enabled) {
			this.register_event_proxies();
			this.enabled = true;
			TPDC.MainLoop.addObject(_t);
		}
	}; // enable();

	this.disable = function() {
		this.unregister_event_proxies();
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

		var box = new Bind.NodeBox(this);

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

		if (this.enemies.length < this.maxRocks) {
			var spawn = this.getSpawnPoint();
			var target = {
				x: this.ship.x + (Math.random() * 20 - 10),
				y: this.ship.y + (Math.random() * 20 - 10)
			};

			// heading
			var rise = target.y - spawn.y;
			var run = target.x - spawn.x;
			var d = Math.atan2(rise, run);

			var enemy = New(SS.Pumpkin, {
				x: spawn.x, y: spawn.y, direction: d,
				speed: 0.2 + (Math.random() * _t.maxRocks / 3.3),
				game: _t
			});

			this.addEnemy(enemy);
		}
	}; // step()

	this.addEnemy = function(enemy) {
		on(enemy, 'shot', function() {
			_t.score += 1;
			_t.maxRocks = Math.max(1, Math.log(_t.score)/Math.log(Math.E));
		});

		on(enemy, 'destroy', function() {
			_t.enemies.splice(_t.enemies.indexOf(enemy), 1);
		});

		on(enemy, 'shatter', function(newEnemy) {
			_t.addEnemy(newEnemy);
		});

		this.appendChild(enemy);
		this.enemies.push(enemy);
	}; // addEnemy()

	this.draw = function() {
	}; // draw()

	this.gameover = function() {
		this.disable();
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
		this.enemies.forEach(function(enemy) {
			enemy.destroy();
		});

		this.score = 0;
		this.maxRocks = 1;

		this.enable();
		this.ship.respawn();
		this.ship.leapTo(50 - _t.ship.width/2, 50 - _t.ship.height/2);

		trackEvent('play');
	}; // restart()

	this.interact = function(e) {
		if (!this.enabled) { return; }

		var mc = new TG.MouseCoords(e);
		var tc = new Bind.NodeBox(this);
		var destination = {
			x: 100 * (mc.x - tc.x)/tc.width,
			y: 100 * (mc.y - tc.y)/tc.height
		};
		this.ship.pushTo(destination);

		return false;
	}; // interact()

	this.register_event_proxies = function() {
		this.ontouchstart = eventProxy(_t, function(e) { _t.interact(e); });
		this.ontouchmove = function() { return false; }
		this.ontouchend = function() { return false; }
		this.ontouchleave  = function() { return false; }
		this.ontouchcancel = function() { return false; }
		this.onmousedown = eventProxy(_t, function(e) { _t.interact(e); });
		this.onclick = function() { return false; }
		this.onmouseup = function() { return false; }
	};

	this.unregister_event_proxies = function() {
		[
			'touchstart',
			'touchmove',
			'touchend',
			'touchleave',
			'touchecancel',
			'mousedown',
			'click',
			'mouseup'
		].forEach(function(event_name) {
			_t['on' + event_name] = null;
		});
	};

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
	<ss:gameoversplash data-id='presplash' heading='Shooty Ship Pumpkin Smash' no-ad='1'></ss:gameoversplash>\
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

SS.Audio.errors = [];

document.addEventListener('deviceready', function() {
	if (window.plugins && window.plugins.LowLatencyAudio) {
		var lla = window.plugins.LowLatencyAudio;
		for (var k in SS.Audio.channels) {
			(function(src) { 
				lla.preloadFX(src, src);
				var a = {
					play: function() { lla.play(src); }
				};
				SS.Audio.channels[src] = a;
			})(k);
		}
	}
}, false);

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
	var coords = new Bind.NodeBox(this);
	var pCoords = new Bind.NodeBox(this.parentNode || document.body);

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

	this.init = function() {
		onready(this).fire();
	}; // init()

	setType(this, 'SS.Ship');
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
		if (this.dead) {
			return;
		}

		var box = new Bind.NodeBox(this);
		var nodes = getNodes(document, search);
		for (var i = 0; i < nodes.length; i++) {
			var target = nodes[i];
			if (!target.dead && box.overlaps(new Bind.NodeBox(target))) {
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
	this.conflicts = [SS.Enemy, SS.Pumpkin, SS.Shrapnel];

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Enemy')) {
			_t.destroy();
		}
	});

	this.init = function() {
		SS.Audio.play(SS.Bullet.sound);
		TPDC.MainLoop.addObject(this);
		onready(this).fire();
	}; // init()

	SS.Projectile.apply(this);
	setType(this, 'SS.Bullet');
}; // Bullet
SS.Bullet.sound = "audio/pew-128.mp3";
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

	var innerDraw = this.draw;
	this.draw = function() {
		var d = Number(this.visibleDirection) + (Math.PI/2);
		this.style.transform = 'rotate(' + d + 'rad)';
		this.style.webkitTransform = 'rotate(' + d + 'rad)';
		this.style.mozTransform = 'rotate(' + d + 'rad)';
		this.style.msTransform = 'rotate(' + d + 'rad)';
		innerDraw.call(this);
	}; // draw()

	this.explode = function(v, impact) {
		on(_t, 'shot').fire();
		_t.parentNode.appendChild(New(SS.Explosion, {
			x: _t.x,
			y: _t.y,
			text: v === undefined ? _t.game.score : v
		}));
		_t.destroy();
	}; // explode()

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Bullet')) {
			_t.explode(_t.game.score + 1, New(SS.Momentum, {
				direction: o.direction, speed: o.speed, mass: 1
			}));
		}
	});

	this.init = function() {
		TPDC.MainLoop.addObject(this);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.Enemy');
}; // Enemy
SS.Enemy.templateMarkup = "";
Bind(SS.Enemy, 'ss:enemy');


SS.Pumpkin = function() {
	var _t = this;
	SS.Enemy.apply(this);

	this.mass = 5;

	var baseExplode = this.explode;
	this.explode = function(v, impact) {
		baseExplode.call(this, v);

		if (!impact) {
			return;
		}

		// todo: make this math ... umm ... based on actual physics.

		var combined_impact = New(SS.Momentum, {
			direction: this.direction,
			speed: this.speed,
			mass: this.mass
		});

		combined_impact.impactBy(impact);

		var shrapnel_count = 3; // Math.floor(Math.random() * 4);
		combined_impact.speed = (combined_impact.speed*0.75)/shrapnel_count;
		for (var i = 0; i < shrapnel_count; i++) {
			this.emitRandomShrapnel(combined_impact);
		}
	}; // explode()

	this.emitRandomShrapnel = function(impact) {
		var subtypes = [
			'round-red-candy',
			'mummy',
			'candle',
			'square-candy'
		];

		var subtype = subtypes[Math.floor(Math.random() * subtypes.length)];

		this.emitShrapnel(impact, subtype);
	}; // emitRandomShrapnel()

	this.emitShrapnel = function(impact, subtype) {
		var momentum = New(SS.Momentum, {
			direction: (Math.random() * Math.PI * 2) - Math.PI,
			speed: 0.25,
			mass: 1.5
		});

		momentum.impactBy(impact);

		var rv = New(SS.Shrapnel, {
			x: _t.x, y: _t.y, direction: momentum.direction,
			speed: momentum.speed,
			game: _t.game,
			subtype: subtype
		});

		on(this, 'shatter').fire(rv);
	}; // emitShrapnel()


	setType(this, 'SS.Pumpkin');
}; // Pumpkin
SS.Pumpkin.templateMarkup = SS.Enemy.templateMarkup;
Bind(SS.Pumpkin, 'ss:pumpkin');


SS.Shrapnel = function() {
	SS.Enemy.apply(this);

	if (this.subtype) {
		addClassname(this, this.subtype);
	}

	setType(this, 'SS.Shrapnel');
}; // Shrapnel
SS.Shrapnel.templateMarkup = "";
Bind(SS.Shrapnel, 'ss:shrapnel');


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

	this.init = function() {
		TPDC.MainLoop.addObject(this);
		SS.Audio.play(SS.Explosion.sound);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.Explosion');
}; // Explosion
SS.Explosion.sound = 'audio/pkewh.mp3';
SS.Audio.prepare(SS.Explosion.sound);
SS.Explosion.templateMarkup =
	"<table><tr><td data-id='text'></td></tr></table>";
Bind(SS.Explosion, 'ss:explosion');


SS.Momentum = function() {

	this.direction = this.direction || 0;
	this.speed = this.speed || 0;
	this.mass = this.mass || 1;

	this.impactBy = function(impactVector) {
		var x = this.getXMomentum() + impactVector.getXMomentum();
		var y = this.getYMomentum() + impactVector.getYMomentum();
		this.direction = Math.atan2(y, x);
		this.speed = Math.sqrt(x * x + y * y) / this.mass;
	}; // impactBy()

	this.getXMomentum = function() {
		return Math.cos(this.direction) * this.speed * this.mass;
	}; // getX()

	this.getYMomentum = function() {
		return Math.sin(this.direction) * this.speed * this.mass;
	}; // getY()

	setType(this, 'SS.Momentum');	
}; // SS.Momentum()


SS.GameOverSplash = function() {
	var _t = this;

	this.delay = this.delay || 1000;

	var score = parseInt(this.score.innerHTML) || 0;

	if (score == 0) {
		this.share.parentNode.removeChild(this.share);
	} else {
		this.share.object = {
			text: "I scored " + score + " in Shooty Ship Pumpkin Smash!"
			+ " It's SpOoKy FuN! Try it out!",
			category: "game"
		};
	}

	var max = 0;
	if (localStorage) {
		max = parseInt(localStorage.getItem(HIGHSCORE_KEY));
		if (!max || max === Math.NaN || max < score) {
			max = score;
			localStorage.setItem(HIGHSCORE_KEY, max);
		}
		this.maxScore.innerHTML = max;
	} else {
		this.maxScoreLine.parentNode.removeChild(this.maxScoreLine);
	}

	on(_t.restart, 'click', function() {
		on(_t, 'restartClick').fire();
		_t.parentNode.removeChild(_t);
	});

	this.init = function() {
		setTimeout(function() {
			addClassname(_t, 'visible');
		}, this.delay);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.GameOverSplash');
}; // GameOverSplash()
SS.GameOverSplash.templateMarkup = "\
	<div class='background'></div>\
	<div class='foreground'>\
	<h1 data-id='heading'>Game Over</h1>\
	<div class='scoreline'>Your score: <span data-id='score' class='score'>...?</span></div>\
	<div data-id='maxScoreLine' class='max-scoreline'>Your best: <span data-id='maxScore' class='score'>...?</span></div>\
	<ss:bannerad data-id='bannerad'></ss:bannerad>\
	<ss:startbutton data-id='restart'>Restart</ss:startbutton>\
	<tpdc:share data-id='share'></tpdc:share>\
	<ss:installlink icon='img/icon.png'></ss:installlink>\
	<div class='copyright'><a target='_blank' href='https://www.thepointless.com'>www.thepointless.com</a></div>\
	</div>\
";
Bind(SS.GameOverSplash, 'ss:gameoversplash');


SS.BannerAd = function() {
	this.show = function() {
		try {
			setTimeout(function() {
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			}, 250);
		} catch {
			// nothing
		}
	}; // show()

	this.hide = function() {
	}; // destroy()

	this.init = function() {
		onready(this).fire();
	}; // init()

	this.show();

	setType(this, 'SS.BannerAd');
}; // BannerAd
SS.BannerAd.templateMarkup = '\
	<!-- Shooty Ship Pumpkin Smash --> \
	<ins class="adsbygoogle" \
		style="display:block" \
		data-ad-client="ca-pub-6115341109827821" \
		data-ad-slot="9599170847" \
		data-ad-format="auto" \
		data-full-width-responsive="true"> \
	</ins>\
';
Bind(SS.BannerAd, 'ss:bannerad');


SS.InstallLink = function() {
	var _t = this;
	this.icon_img.src = this.icon;

	if (SS.InstallLink.evt) {
		_t.classList.add('show');
	}

	this.button.onclick = function(e) {
		SS.InstallLink.evt.prompt();
		SS.InstallLink.evt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === 'accepted') {
				_t.classList.remove('show');
				console.log('User accepted the A2HS prompt');
				trackEvent('install');
			} else {
				console.log('User dismissed the A2HS prompt');
				trackEvent('cancelled-install');
			}
			SS.InstallLink.evt = null;
		});
	};
};
SS.InstallLink.templateMarkup = "\
	<hr />\
	<div data-id='button' class='button'>\
	<img data-id='icon_img' />\
Install\
	</div>\
";
Bind(SS.InstallLink, 'ss:installlink');


window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault();
	SS.InstallLink.evt = e;
});
