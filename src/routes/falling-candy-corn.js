const { MainLoop } = require('/src/lib/loop.js');
const { on } = require('/src/lib/event.js');

const Space = DomClass("<tpdc:space></tpdc:space>", function() {
	var _t = this;

	var actives = 0;

	this.step = function({elapsed}) {
		if (this.actives == 0 || elapsed > (Math.random() * 0.1)) {
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
	this.speed = 15 + Math.random() * 15;

	this.style.width = this.speed * 0.135 + "rem";
	this.style.height = this.speed * 0.200 + "rem";

	this.step = function({elapsed}) {
		if (this.y > 110) {
			this.dead = true;
			on(this, 'die').fire();
			return;
		}

		this.y += (this.speed * elapsed);
	}; // step()

	this.draw = function() {
		this.style.top = this.y + "%";
		this.style.left = this.x + "%";
	}; // draw()

	MainLoop.addObject(this);
});
