body {
	cursor: crosshair;
}

.game_container {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	cursor: crosshair;
	background-color: transparent;
	overflow: hidden;
	z-index: 5;
}

.cover {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	z-index: 1000;
}

.achievements {
	position: absolute;
	top: 10px;
	left: 10px;
	width: 200px;
	z-index: 30;
}

.notification {
	border: 3px solid #d0e5ff;
	background-color: #ffffdd;
	width: 100%;
	padding: 5px;
	margin-bottom: 5px;
}

.demo_grid {
	position: absolute;
	top: 0px;
	left: 0px;
	border: 0px;
	margin: 0px;
	padding: 0px;
	width: 100%;
	height: 100%;
	z-index: 10;
	border-collapse: collapse;
}

.demo_grid tr {
}

.demo_grid tr td {
	/* width: 10%; */
	/* height: 10%; */
	border: 0px;
	padding: 1px;
	margin: 0px;
}

.level_indicator {
	position: absolute;
	top: 10px;
	right: 10px;
	font-size: 20px;
	font-weight: bold;
	opacity: 0.7;
	z-index: 20;
}

.hp_indicator {
	position: absolute;
	top: 60px;
	right: 10px;
	font-size: 20px;
	font-weight: bold;
	opacity: 0.7;
	z-index: 20;
}

.score_indicator {
	position: absolute;
	top: 35px;
	right: 10px;
	font-size: 20px;
	font-weight: bold;
	opacity: 0.7;
	z-index: 20;
}

.monster {
	margin: 0px;
	padding: 0px;
	position: absolute;
	font-size: 10px;
	line-height: 7px;
	border: 1px solid transparent;
	z-index: 20;
}

.monster pre {
	font-family: Courier, Lucida Console, monospace;
}

.hud {
	border: 2px solid #00cc00;
	background-color: #ccffcc;
	opacity: 0.5;
	filter: alpha(opacity=50);
	position: absolute;
	cursor: crosshair;
	font-size: 10px;
	z-index: 20;
}

.gunshot {
	position: absolute;
	font-family: Arial, sans-serif;
	font-weight: normal;
	border: 0px;
	margin: 0px;
	padding: 0px;
	z-index: 20;
}

.roundup_backdrop {
	position: absolute;
	height: 100%;
	width: 100%;
	z-index: 2000;
	background-color: #000000;
	opacity: 0.75;
}

.roundup_infobox {
	position: absolute;
	/* top: 30%; */
	top: 75px;
	left: 30%;
	width: 40%;
	/* height: 40%; */
	border: 10px solid #660000;
	padding: 10px;
	background-color: white;
	z-index: 4000;
}

.container_table {
	width: 95%;
	margin: 10px auto;
	padding-bottom: 15px;
	border-bottom: 1px solid silver;
}

.container_table tr td {
	padding: 5px;
}

