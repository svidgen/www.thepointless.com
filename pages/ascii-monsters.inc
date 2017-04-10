<?php

	$meta_title = "ASCII Monsters";

	
	// pre-authorize some asynch rewards
	include('includes/game.inc');

	// Dead ASCII Monsters at a rate of 1 per 10 seconds, scalable.
	$monster_kill = allow_awards(array(
		award_cap("Tamed ASCII Monster", 1, 3600, false),
		award_cap("Severely Injured ASCII Monster", 1, 30, false),
		award_cap("Dead ASCII Monster", 1, 5, false)
	));

?>

<link type='text/css' rel='stylesheet' href='/sheets/ascii-monsters.css?v=<?php print $general_version; ?>' />

<div>
	Srsly. They're all over the place. And we need your help destroying them before they consume the whole site! When you're ready, let us know, and we'll let you at 'em.
</div>


<div style='margin: 100px auto; text-align: center; font-size: x-large; font-weight: bold;'>
	<tpdc:startbutton id='startbutton' style='opacity: 0.25; filter: alpha(opacity=25); cursor: pointer;'>Loading ... </tpdc:startbutton>
</div>

<div style='display: none;'>Tip:
	<span class='tip'>Use as few shots as you can&mdash;they cause more damage than some of the monsters.<span>
	<span class='tip'></span>
</div>

<div id='__stats' style='z-index: 10000; position: absolute; bottom: 10px; right: 10px; background-color: white;'></div>


<script type='text/javascript' src='/js/color.js?v=<?php print $general_version; ?>'></script>
<script type='text/javascript' src='/js/ascii-monsters.js?v=<?php print $general_version; ?>'></script>

<script type='text/javascript'>
(function() {

	var __a = function(q, t) {
		TPDC.jsonp('game', {
				token: monster_kills.pop(),
				item: t,
				quantity: q
			},
			function (rv) {
				monster_kills.push(rv.new_token);
				if (rv.quantity > 0) {
					TPDC.Notify("Item Collected", String(q) + " " + t);
				}
			}
		);

		g.__awards_given = 1;
	} // __a()
 

	var __c = {
		// background_image : 'svidgen_logo.jpg',
		background_image: 'Arbres.jpg',
		background_fade_color: new Color("#ffffff"),
		background_fade_amount: 0.5,

		grid_width: 32,
		grid_height: 24,

		// collateral_damage: 10,

		kill_triggers: [
			function(g, m) {

				if (!g.general['heartkills']) {
					g.general.heartkills = 0;
				}

				if (m instanceof HeartMonster) {
					// g.achieve('Heart Kill!', "Heart kills heal the page. Postpone these kills for the most opportune time!");

					g.general.heartkills += 1;
					switch (g.general.heartkills) {
						case 16:	// 16
							g.c.collateral_damage = 0;
							g.c.shot_color = new Color(0, 0, 220);
							g.achieve('Heart Attack!','Shots <b>deal NO collateral damage</b>.');
							break;

						case 32:	// 24
							// g.c.collateral_damage = -0.20;
							g.c.collateral_damage = -1;
							g.c.shot_color = new Color(0, 140, 140);
							g.achieve('Double Bypass!','Shots deal <b>20% healing</b>!');
							break;

						case 48:	// 32
							// g.c.collateral_damage = -0.35;
							g.c.collateral_damage = -2.5;
							g.c.shot_color = new Color(0, 140, 0);
							g.achieve('Triple Bypass!','Shots deal <b>35% healing</b>!');
							break;

						case 64:	// 64
							// g.c.collateral_damage = -0.45;
							g.c.collateral_damage = -5;
							g.c.shot_color = new Color(0, 180, 0);
							g.achieve('Quadruple Bypass!','Shots deal <b>45% healing</b>!');
							break;

						default:
					}
				} else {

					var drops = {
						"Tamed ASCII Monster": (1/256) * (g.level / m.level),
						"Severely Injured ASCII Monster": (1/128) * (g.level / m.level),
						"Dead ASCII Monster": (1/4) * (g.level / m.level)
					};

					var r = Math.random();
					var drop = false;
					for (var i in drops) {
						if (r <= drops[i]) {
							if (!drop || drops[i] < drop.c) {
								drop = {t: i, c: drops[i]};
							}
						}
					}
					if (drop) {
						__a(1, drop.t);
					}
				}

			} // function(g, m) : HeartMonster kills
		]
	};

	var monster_kills = ["<?php print $monster_kill; ?>"];
	var g = new Game(__c);


	TPDC = window['TPDC'] || {};
	TPDC.StartButton = function() {
		this.innerHTML = "I'm ready.";
		this.style.opacity = 1.0;
		this.style.filter = 'alpha(opacity=100)';
		this.onclick = function() { g.start(); };
	} // tpdc:start

	__tpdcq = window['__tpdcq'] || [];
	__tpdcq.push(function() {
		Bind(TPDC.StartButton, 'tpdc:startbutton');
	});


	/*
	var sbs = getNodes(document, 'tpdc:start');
	for (var i = 0; i < sbs.length; i++) {
		var sb = sbs[i];
		sb.innerHTML = "I'm ready.";
		sb.style.opacity = 1.0;
		sb.style.filter = 'alpha(opacity=100)';
		sb.onclick = function() { g.start(); };
	}
	*/

	// expose only certain game functions to the global scope
	window.g = {
		container : {
			grid : {
				loadImage: function(d) {
					return g.container.grid.loadImage(d);
				}
			}
		}
	};

})();
</script>

<!--

<?php // print_r($_SESSION); ?>

-->
