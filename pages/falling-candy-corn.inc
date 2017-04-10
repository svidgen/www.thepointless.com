<?php
	$meta_title = 'falling candy corn';
?>

<style type='text/css'>

cc\:game {
	display: block;
	position: relative;
	width: 90%;
	height: 80vh;
	border: 0.5rem solid orange;
	background-color: black;
	overflow: hidden;
}

cc\:candycorn {
	position: absolute;
	display: block;
	width: 1.35rem;
	height: 2.00rem;
	z-index: 10;
	background-color: transparent;
	background-image: url(/images/candy-corn-medium.png);
	background-size: 100% 100%;
}

</style>

<cc:game></cc:game>

<script type='text/javascript'>upon(function() { return window.TPDC && TPDC.MainLoop; }, function() {

var CC = {};

CC.Game = function() {
	var _t = this;

	var actives = 0;

	this.step = function() {
		if (this.actives == 0 || Math.random() > 0.0015) {
			this.active++;
			var cc = New(CC.CandyCorn, {});
			on(cc, 'die', function() {
				_t.removeChild(cc);
			});

			this.appendChild(cc);
		}
	}; // step()

	this.draw = function() {
	}; // draw()

	TPDC.MainLoop.addObject(this);

	setType(this, 'CC.Game');
	onready(this).fire();
}; // CC.Game()
CC.Game.templateMarkup = "";
Bind(CC.Game, 'cc:game');


CC.CandyCorn = function() {
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

	TPDC.MainLoop.addObject(this);

	setType(this, 'CC.CandyCorn');
	onready(this).fire();
}; // CC.CandyCorn()
CC.CandyCorn.templateMarkup = "";
Bind(CC.CandyCorn, 'cc:candycorn');

});</script>

