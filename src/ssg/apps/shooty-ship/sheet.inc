<?php
	$require_theme = 'css';
?>

html, body {
	width: 100%;
	height: 100%;
	padding: 0px;
	margin: 0px;
	overflow: hidden;
}

ss\:board {
	position: absolute;
	display: block;
	width: 100%;
	height: 100%;
	margin: 0px;
	padding: 0px;
	border: 0px solid black;
	background-image: url('/images/shiny.jpg');
	overflow: hidden;
}

ss\:startbutton, ss\:sharebutton {
	display: inline-block;
	width: 35%;
	cursor: pointer;
	border: 5px solid silver;
	background-color: white;
	text-align: center;
	font-size: 1rem;
	margin: 1em;
}

ss\:ship {
	position: absolute;
	display: block;
	/* 128x73 */
	width: 6.7%;
	height: 3.8%;
	text-align: center;
	background-image: url('/images/shooty-ship-128x73.png');
	background-size: 100% 100%;
}

ss\:bullet {
	position: absolute;
	display: block;
	top: -100%;
	left: -100%;
	width: 1.5%;
	height: 1.5%;
	background-color: #ff1e00;
	border: 0.25% solid #663300;
	border-radius: 50%;
	-webkit-border-radius: 50%;
	-moz-border-radius: 50%;
	overflow: hidden;
}

ss\:enemy {
	position: absolute;
	display: block;
	/* 150x150 */
	width: 7.8%;
	height: 7.8%;
	background-image: url('/images/shooty-ship-rock-150x150.png');
	background-size: 100% 100%;
}

ss\:explosion {
	position: absolute;
	display: block;
	background-color: #ff1e00;
	border: 15px solid #663300;
	border-radius: 50%;
	top: -100%;
	left: -100%;
	-webkit-border-radius: 50%;
	-moz-border-radius: 50%;
}

ss\:explosion table {
	width: 100%;
	height: 100%;
}

ss\:explosion table td {
	width: 100%;
	height: 100%;
	text-align: center;
	vertical-align: middle;
	color: black;
	font-weight: bold;
}

ss\:gameoversplash {
	transition: opacity 3s, filter 3s;
	-webkit-transition: opacity 3s, filter 3s;
	opacity: 0;
	filter: alpha(opacity=0);
}

ss\:gameoversplash.visible {
	opacity: 1;
	filter: alpha(opacity=100);
}

ss\:gameoversplash .background {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0px;
	left: 0px;
	background-color: black;
	opacity: 0.5;
	filter: alpha(opacity=50);
	z-index: 1000;
}

ss\:gameoversplash .foreground {
	position: fixed;
	width: calc(80% - 5px);
	max-width: 480px;
	top: 0;
	left: 0;
	right: 0;
	margin: 20% auto;
	background-color: white;
	border: 10px solid #884444;
	z-index: 1001;
	text-align: center;
}

ss\:gameoversplash .foreground h1 {
	color: #dd4444;
	font-family: Verdana, sans-serif;
	font-size: 24pt;
}

.scoreline, .max-scoreline {
	display: block;
	font-size: 22pt;
	color: #555555;
	/*
	background-image: url('/images/shooty-ship-rock-150x150.png');
	background-repeat: no-repeat;
	background-size: 8% 8%;
	height: 8%;
	padding-left: 9%;
	margin-bottom: 5%;
	*/
	text-align: center;
	margin: 14pt;
}

.max-scoreline {
	font-size: 18pt;
}

ss\:gameoversplash .score {
	font-weight: bold;
	color: #dd4444;
}

ss\:bannerad {
	width: 100%;
	max-height: 18%;
	position: fixed;
	top: 0px;
	left: 0px;
	z-index: 10000;
}
