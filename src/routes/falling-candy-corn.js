const { MainLoop } = require('/src/lib/loop.js');
const { on } = require('/src/lib/event.js');

const Space = DomClass("<tpdc:space></tpdc:space>", function() {
	var _t = this;

	var actives = 0;

	this.step = function() {
		if (this.actives == 0 || Math.random() > 0.0015) {
			this.active++;
			var cc = new CandyCorn();
			on(cc, 'die', function() {
				_t.removeChild(cc);
			});

			this.appendChild(cc);
		}
	}; // step()

	this.draw = function() {
	}; // draw()

	MainLoop.addObject(this);
});

const CandyCorn = DomClass("<tpdc:candycorn></tpdc:candycorn>", function() {
	var _t = this;

	this.x = Math.random() * 100;
	this.y = -15;
	this.speed = 0.5 + Math.random() * 1.5;

	this.style.width = this.speed * 1.35 + "rem";
	this.style.height = this.speed * 2.00 + "rem";

	this.step = function() {
		if (this.y > 110) {
			this.dead = true;
			on(this, 'die').fire();
			return;
		}

		this.y += this.speed;
	}; // step()

	this.draw = function() {
		this.style.top = this.y + "%";
		this.style.left = this.x + "%";
	}; // draw()

	MainLoop.addObject(this);
});
