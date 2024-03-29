const { DomClass, setType, isa, getNodes } = require('wirejs-dom');
const { MouseCoords, NodeBox } = require('/src/lib/coords');
const { MainLoop } = require('/src/lib/loop');
const { on, onready } = require('/src/lib/event');
const { trackEvent } = require('/src/lib/tracking');
const { InstallLink } = require('/src/components/install-link');
const ShareLink = require('/src/components/share');
require('./game.css');

global.MainLoop = MainLoop;

let HIGHSCORE_KEY = 'shooty-ship-beta.highscore';
let SHRAPNEL_TYPES;
let ENEMY_TYPES;
let GAME_NAME;
let PATH_NAME;
let SHARE_TITLE;
let SHARE_TEXT;
let SHARE_HEADER;

const gameTemplate = `<ss:game>
	<ss:gameoversplash data-id='presplash' no-ad='1'></ss:gameoversplash>
	<ss:ship data-id='ship' style='top: -100%; left: -100%;'></ss:ship>
</ss:game>`;

const Game = DomClass(gameTemplate, function _Board() {
	var _t = this;

	this.enabled = false;

	this.minX = 0;
	this.maxX = 100;
	this.minY = 0;
	this.maxY = 100;

	this._enemies = [];

	GAME_NAME = this.name || 'Shooty Ship - BETA';
	SHARE_TITLE = this['share-title'] || `Check out ${GAME_NAME}`;
	SHARE_TEXT = this['share-text'] || `I just scored {SCORE} in ${GAME_NAME}! Can you beat that? #pewpewpew`;
	SHARE_HEADER = this['share-header'] || 'See how well your friends do!';
	PATH_NAME = this.path || '/';
	HIGHSCORE_KEY = GAME_NAME.replace(/\s+/g, '-') + '.highscore';

	SHRAPNEL_TYPES = (this.shrapnel || '').replace('/\s+/g', '')
		.split(',')
		.map(s => s.trim())
		.filter(s => s.length > 0)
	;
	console.log('shrapnel types registered', SHRAPNEL_TYPES);

	ENEMY_TYPES = (this.enemies || '').replace('/\s+/g', '')
		.split(',')
		.map(s => s.trim())
		.filter(s => s.length > 0)
	;
	console.log('enemy types registered', ENEMY_TYPES);

	this.presplash.heading = GAME_NAME;


	// hack.
	// require()'d CSS rewrites url()'s to be relative to the CSS file.
	// normally, that's what you'd want. but, it's not what we want, especially
	// with a common sheet across PWA's.
	this.style.backgroundImage = "url('./img/shiny.jpg')";

	this.enable = function() {
		if (!this.enabled) {
			this.register_event_proxies();
			this.enabled = true;
			MainLoop.addObject(_t);
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

		var box = new NodeBox(this);

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

		if (this._enemies.length < this.maxRocks) {
			var spawn = this.getSpawnPoint();
			var target = {
				x: this.ship.x + (Math.random() * 20 - 10),
				y: this.ship.y + (Math.random() * 20 - 10)
			};

			// heading
			var rise = target.y - spawn.y;
			var run = target.x - spawn.x;
			var d = Math.atan2(rise, run);

			// enemy type
			const subtypes = ENEMY_TYPES || [];
			if (subtypes.length < 0) {
				throw new Error("No enemy types registered!");
				
			}

			var enemy = new BigEnemy({
				x: spawn.x, y: spawn.y, direction: d,
				speed: 6.0 + (10 * Math.random() * _t.maxRocks),
				game: _t,
				subtype: subtypes[Math.floor(Math.random() * subtypes.length)]
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
			_t._enemies.splice(_t._enemies.indexOf(enemy), 1);
		});

		on(enemy, 'shatter', function(newEnemy) {
			_t.addEnemy(newEnemy);
		});

		this.appendChild(enemy);
		this._enemies.push(enemy);
	}; // addEnemy()

	this.draw = function() {
	}; // draw()

	this.gameover = function() {
		this.disable();
		setTimeout(function() {
			var splash = new GameOverSplash({
				board: _t,
				score: _t.score,
			});
			on(splash, 'restartClick', function() { _t.start(); });
			_t.appendChild(splash);
		}, 2000);
	}; // gameover()

	this.start = function() {
		this._enemies.forEach(function(enemy) {
			enemy.destroy();
		});

		this.score = 0;
		this.maxRocks = 1;

		this.enable();
		this.ship.respawn();
		this.ship.leapTo(50 - _t.ship.width/2, 50 - _t.ship.height/2);

		trackEvent('game', 'play');
	}; // restart()

	this.interact = function(e) {
		if (!this.enabled) { return; }

		var mc = new MouseCoords(e);
		var tc = new NodeBox(this);
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
});


const AudioPool = {
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

AudioPool.errors = [];

document.addEventListener('deviceready', function() {
	if (window.plugins && window.plugins.LowLatencyAudio) {
		var lla = window.plugins.LowLatencyAudio;
		for (var k in AudioPool.channels) {
			(function(src) { 
				lla.preloadFX(src, src);
				var a = {
					play: function() { lla.play(src); }
				};
				AudioPool.channels[src] = a;
			})(k);
		}
	}
}, false);

const Button = function() {
	this.onclick = function() {
		on(this, 'click').fire();
		return false;
	}; // onclick()
	this.ontouchend = this.onclick;
	setType(this, 'SS.Button');
};


const StartButton = DomClass("<ss:startbutton>Start</ss:startbutton>", function StartButton() {
	Button.apply(this);
	setType(this, 'SS.StartButton');
});


const MagicallySizedObject = function() {
	var coords = new NodeBox(this);
	var pCoords = new NodeBox(this.parentNode || document.body);

	this.width = 100 * coords.width / pCoords.width;
	this.height = 100 * coords.height / pCoords.height;

	setType(this, 'SS.MagicallySizedObject');
}; // MagicallySizedObject()


const Ship = DomClass('<ss:ship></ss:ship>', function Ship() {
	var _t = this;

	this.x = this.x || 0;
	this.y = this.y || 0;

	this.style.backgroundImage = "url(./img/shooty-ship.png)";

	MagicallySizedObject.apply(this);

	this.direction = this.direction || Math.PI/-2; 
	this.target = {x: _t.x, y: _t.y, direction: _t.direction};

	this.enabled = false;

	this.enable = function() {
		if (!this.enabled) {
			MainLoop.addObject(this);
			this.enabled = true;
		}
	}; // enable()

	this.disable = function() {
		if (this.enabled) {
			MainLoop.removeObject(this);
			this.enabled = false;
		}
	}; // disable();

	this.leapTo = function(x, y, direction) {
		this.x = x;
		this.y = y;
		this.direction = direction || Math.PI/-2;
		this.target = {x: _t.x, y: _t.y, direction: _t.direction};
	}; // leapTo()

	this.step = function({elapsed}) {
		if (!elapsed) return;

		var t = this.target.direction;
		var c = this.direction;
		this.direction = this.direction + 30 * elapsed * Math.atan2(
			Math.sin(this.target.direction - this.direction),
			Math.cos(this.target.direction - this.direction)
		) / 4;

		const xSpeed = 30 * (this.target.x - this.x) / 12;
		const ySpeed = 30 * (this.target.y - this.y) / 12;

		this.x += xSpeed * elapsed;
		this.y += ySpeed * elapsed;
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
					new Explosion({
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
		var bullet = new Bullet({
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
});

const Projectile = function() {
	var _t = this;

	this.x = Number(this.x || 0);
	this.y = Number(this.y || 0);
	this.width = Number(this.width || 1);
	this.height = Number(this.height || 1);

	this.ix = this.x;
	this.iy = this.y;

	this.direction = this.direction || 0;
	this.speed = this.speed || 75;
	this.range = this.range || 130;
	this.dead = false;

	this.conflicts = this.conflicts || [];

	this.destroy = function() {
		on(this, 'destroy').fire();
		this.dead = true;
		this.parentNode ? this.parentNode.removeChild(this) : 1;
	}; // destroy()

	this.step = function({elapsed}) {
		var dx = this.x - this.ix;
		var dy = this.y - this.iy;
		var travelled = Math.sqrt(dx * dx + dy * dy);
		if (travelled >= this.range) {
			this.destroy();
		} else {
			const stepSize = this.speed * elapsed;
			this.x += Math.cos(this.direction) * stepSize;
			this.y += Math.sin(this.direction) * stepSize;
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

		var box = new NodeBox(this);
		var nodes = getNodes(document, search);
		for (var i = 0; i < nodes.length; i++) {
			var target = nodes[i];
			if (!target.dead && box.overlaps(new NodeBox(target))) {
				on(this, 'collide').fire(nodes[i]);
				on(nodes[i], 'collide').fire(this);
			}
		}
	}; // findCollisionsWith()

	setType(this, 'SS.Projectile');
}; // Projectile


const Bullet = DomClass('<ss:bullet></ss:bullet>', function _Bullet() {
	var _t = this;

	this.speed = this.speed || 60;
	this.conflicts = [Enemy, BigEnemy, Shrapnel];

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Enemy')) {
			_t.destroy();
		}
	});

	this.init = function() {
		AudioPool.play(Bullet.sound);
		MainLoop.addObject(this);
		onready(this).fire();
	}; // init()

	Projectile.apply(this);
	setType(this, 'SS.Bullet');
}); // Bullet
Bullet.sound = "audio/pew-128.mp3";
AudioPool.prepare(Bullet.sound);


const Enemy = DomClass('<ss:enemy></ss:enemy>', function Enemy() {
	Projectile.apply(this);
	var _t = this;

	this.speed = this.speed || 30;
	this.width = 11.7;
	this.height = 11.7;

	this.visibleDirection = this.visibleDirection || 0;
	this.rotationSpeed = 30 * (Math.random() * 0.4 - 0.2);

	this.conflicts = [Ship];

	this._step = this.step;
	this.step = function({now, elapsed, elapsed_ms}) {
		const rotationStep = elapsed * this.rotationSpeed;
		this.visibleDirection = this.visibleDirection + rotationStep;
		this._step({now, elapsed, elapsed_ms});
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
		_t.parentNode.appendChild(new Explosion({
			x: _t.x,
			y: _t.y,
			text: v === undefined ? _t.game.score : v
		}));
		_t.destroy();
	}; // explode()

	on(this, 'collide', function(o) {
		if (isa(o, 'SS.Bullet')) {
			_t.explode(_t.game.score + 1, new Momentum({
				direction: o.direction, speed: o.speed, mass: 1
			}));
		}
	});

	this.init = function() {
		MainLoop.addObject(this);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.Enemy');
}); // Enemy


const BigEnemy = DomClass('<ss:bigenemy></ss:bigenemy>', function _BigEnemy() {
	var _t = this;
	Enemy.apply(this);

	this.mass = 5;

	this.scale = 0.09;
	if (this.subtype) {
		var img = new Image();
		img.onload = function() {
			_t.style.width = img.width * _t.scale + 'vmin';
			_t.style.height = img.height * _t.scale + 'vmin';
		};
		img.src = 'img/' + this.subtype + ".png";
		this.style.backgroundImage = "url('" + img.src + "')";
	}

	var baseExplode = this.explode;
	this.explode = function(v, impact) {
		baseExplode.call(this, v);

		if (!impact) {
			return;
		}

		var combined_impact = new Momentum({
			direction: this.direction,
			speed: this.speed,
			mass: this.mass
		});

		combined_impact.impactBy(impact);

		// var shrapnel_count = 3; Math.floor(Math.random() * 4);
		const shrapnel_count = Math.floor(Math.random() * 5);
		combined_impact.speed = (combined_impact.speed*0.75)/shrapnel_count;
		for (var i = 0; i < shrapnel_count; i++) {
			this.emitRandomShrapnel(combined_impact);
		}
	}; // explode()

	this.emitRandomShrapnel = function(impact) {
		const subtypes = SHRAPNEL_TYPES || [];
		if (subtypes.length > 0) {
			var subtype = subtypes[Math.floor(Math.random() * subtypes.length)];
			this.emitShrapnel(impact, subtype);
		}
	}; // emitRandomShrapnel()

	this.emitShrapnel = function(impact, subtype) {
		var momentum = new Momentum({
			direction: (Math.random() * Math.PI * 2) - Math.PI,
			speed: 7.5,
			mass: 1.5
		});

		momentum.impactBy(impact);

		var rv = new Shrapnel({
			x: _t.x, y: _t.y, direction: momentum.direction,
			speed: momentum.speed,
			game: _t.game,
			subtype: subtype
		});

		on(this, 'shatter').fire(rv);
	}; // emitShrapnel()


	setType(this, 'SS.Pumpkin');
}); // Pumpkin


const Shrapnel = DomClass('<ss:shrapnel></ss:shrapnel>', function Shrapnel() {
	Enemy.apply(this);
	var _t = this;

	this.scale = 0.05;

	if (this.subtype) {
		var img = new Image();
		img.onload = function() {
			_t.style.width = img.width * _t.scale + 'vmin';
			_t.style.height = img.height * _t.scale + 'vmin';
		};
		img.src = 'img/' + this.subtype + ".png";
		this.style.backgroundImage = "url('" + img.src + "')";
	}

	setType(this, 'SS.Shrapnel');
}); // Shrapnel


const explosionTemplate = `<ss:explosion>
	<table><tr><td data-id='text'></td></tr></table>
</ss:explosion>`;

const Explosion = DomClass(explosionTemplate, function _Explosion() {
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

	this.step = function({now}) {
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
		MainLoop.addObject(this);
		AudioPool.play(Explosion.sound);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.Explosion');
}); // Explosion
Explosion.sound = 'audio/pkewh.mp3';
AudioPool.prepare(Explosion.sound);


const Momentum = function({direction, speed, mass}) {

	this.direction = direction || 0;
	this.speed = speed || 0;
	this.mass = mass || 1;

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

const gameOverSplashTemplate = `<ss:gameoversplash>
	<div class='background'></div>
	<div class='foreground'>
		<h1 data-id='heading'>Game Over</h1>
		<div class='scoreline'>Your score: <span data-id='score' class='score'>...?</span></div>
		<div data-id='maxScoreLine' class='max-scoreline'>Your best: <span data-id='maxScore' class='score'>...?</span></div>
		<ss:bannerad data-id='bannerad'></ss:bannerad>
		<ss:startbutton data-id='restart'>Restart</ss:startbutton>
		<div data-id='share'></div>
		<ss:installlink category='game' icon='img/icon.png'></ss:installlink>
		<div class='copyright'><a target='_blank' href='https://www.thepointless.com'>www.thepointless.com</a></div>
	</div>
</ss:gameoversplash>`;

const GameOverSplash = DomClass(gameOverSplashTemplate, function _GameOverSplash() {
	var _t = this;

	this.delay = this.delay || 1000;

	const score = parseInt(this.score) || 0;

	this.share = new ShareLink({
		title: SHARE_TITLE.replace('{SCORE}', score),
		text: SHARE_TEXT.replace('{SCORE}', score),
		header: SHARE_HEADER.replace('{SCORE}', score)
	});

	if (score == 0) {
		this.share.parentNode.removeChild(this.share);
	}

	let max = 0;
	if (localStorage) {
		max = Math.max(
			parseInt(localStorage.getItem(HIGHSCORE_KEY)) || 0,
			score
		);
		localStorage.setItem(HIGHSCORE_KEY, max);
		_t.maxScore = max;
	} else {
		_t.maxScoreLine.parentNode.removeChild(this.maxScoreLine);
	}

	on(_t.restart, 'click', function() {
		on(_t, 'restartClick').fire();
		_t.parentNode.removeChild(_t);
	});

	this.init = function() {
		setTimeout(function() {
			_t.classList.add('visible');
		}, this.delay);
		onready(this).fire();
	}; // init()

	setType(this, 'SS.GameOverSplash');
}); // GameOverSplash()

const bannerAdTemplate = `<ss:bannerad>
	<!-- Shooty Ship -->
	<ins class="adsbygoogle"
		style="display:block"
		data-ad-client="ca-pub-6115341109827821"
		data-ad-slot="9599170847"
		data-ad-format="auto"
		data-full-width-responsive="true">
	</ins>
</ss:bannerad>`;

const BannerAd = DomClass(bannerAdTemplate, function BannerAd() {
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
}); // BannerAd


module.exports = {
	DomClass, setType, isa, getNodes,
	MouseCoords, NodeBox,
	MainLoop,
	on, onready,
	trackEvent,
	InstallLink
};
