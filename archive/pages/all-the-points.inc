<?php

	$meta_title = "all the points";

?>

<script type='text/data' id='tpdc-pointclickergame'>
	<div data-id='thing'></div>
	<div data-id='availability'>Available again in
		<b><tpdc:countdown data-id='nextAwardable'>?</tpdc:countdown></b>.
	</div>
	<tpdc:pointclicker data-id='clicker'></tpdc:pointclicker>
	<tpdc:signinplea link='Sign in to save your stuff!'></tpdc:signinplea>
	<tpdc:share data-id='sharer'></tpdc:share>
</script>

<script type='text/data' id='tpdc-points'>
	<div>
		<div data-id='title'>title</div>
		<div data-id='points'>0</div>
	</div>
</script>

<script type='text/data' id='tpdc-pointclicker'>
	+1
</script>

<tpdc:pointclickergame point='Point'></tpdc:pointclickergame>




<script type='text/javascript'>

upon('TPDC', function() {

	TPDC.PointClickerGame = function() {
		var _t = this;

		this.point = this.point || 'Point';

		var nextAwardable = 0;

		this.update = function(totals) {
			_t.thing.setQuantity(totals.total);
			_t.thing.drawNotice();
			nextAwardable = (new Date()).getTime() + (
				totals.next_awardable * 1000
			);
			_t.nextAwardable.set(nextAwardable);
			_t.sharer.object = {
				text: "I have " + totals.total + " " + _t.point + "s!"
			};
			TG.addClassname(_t.clicker, 'inactive');
			TG.removeClassname(_t.availability, 'inactive');
		}; // update()

		on(_t.nextAwardable, 'end', function() {
			TG.removeClassname(_t.clicker, 'inactive');
			TG.addClassname(_t.availability, 'inactive');
		});

		_t.clicker.point = _t.point;

		on(_t.clicker, 'succeed', _t.update);
		TPDC.API.getThings({name:_t.point}).returnTo(function(rows) {
			_t.thing = New(TPDC.Thing, rows[0]);
		});
		TPDC.API.awardThing({item:_t.point,quantity:0}).returnTo(_t.update);

	}; // PointClickerGame
	TPDC.PointClickerGame.templateMarkup = document
		.getElementById('tpdc-pointclickergame').innerHTML;
	Bind(TPDC.PointClickerGame, 'tpdc:pointclickergame');


	TPDC.Countdown = function() {
		var _t = this;

		this.end = this.end || 0;
		this.remainingSeconds = 0;

		this.set = function(end) {
			this.end = end;
			TPDC.MainLoop.addObject(_t);
		}; // set()

		this.step = function() {
			var seconds = (_t.end - (new Date())) / 1000;
			_t.remainingSeconds = Math.max(seconds, 0);
			if (seconds <= 0) {
				on(_t, 'end').fire();
				TPDC.MainLoop.removeObject(this);
			}
		}; // step()

		this.draw = function() {
			_t.seconds = _t.remainingSeconds.toFixed(1);
		}; // draw()

	}; // Countdown
	TPDC.Countdown.templateMarkup = 
		"<span data-id='seconds'>0.0</span> seconds"
		/* "<span data-id='hours'>00</span>"
		+ ":<span data-id='minutes'>00</span>"
		+ ":<span data-id='seconds'>00.0/span>" */
	;
	Bind(TPDC.Countdown, 'tpdc:countdown');


	TPDC.PointClicker = function() {
		var _t = this;
		this.point = this.point || 'Point';
		this.onclick = function() {
			TPDC.API.awardThing({item:_t.point, quantity:1})
			.returnTo(function(rv) {
				if (rv.awarded > 0) {
					on(_t, 'succeed').fire(rv);
				}
			});
		}; // onclick()
	}; // PointClicker
	TPDC.PointClicker.templateMarkup = document
		.getElementById('tpdc-pointclicker').innerHTML;
	Bind(TPDC.PointClicker, 'tpdc:pointclicker');

});

</script>
