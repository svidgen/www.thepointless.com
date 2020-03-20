/*****************
    BASIC TAGS
*****************/

body {
	margin: 0px;
	padding: 0px;
	font-family: Arial, sans-serif;
	font-size: 12pt;
	line-height: 1.2;
	background: url(/images/shiny.jpg);
	color: #333333;
}

@media (max-width: 50rem) {
}

img {
	border: 0px;
}

a, tpdc\:start {
	color: #0044aa;
	text-decoration: none;
}

a:hover, tpdc\:start:hover {
	color: #660000;
	text-decoration: underline;
}

a.nohoverdecoration, tpcd\:start.nohoverdecoration {
	text-decoration: none;
}

hr {
	margin: 2rem auto;
	width: 65%;
	height: 1px;
	border: 0px;
	background-color: silver;
}


/******************
  TEMPLATE PARTS
******************/

#container {
	position: relative;
	width: 90%;
	max-width: 60rem;
	margin: 2rem auto;
	padding: 0.5rem;
	background-color: white;
	border: 1px solid #cccccc;
	overflow: hidden;	/* float containment */
}

.content {
	overflow: hidden;
	padding: 0.85rem;
	padding-top: 0px;
	line-height: 1.3rem;
	text-align: justify;
}

#footer {
	clear: both;
	text-align: center;
}

#sub-footer {
	margin-top: 2rem;
	font-size: smaller;
	color: #555555;
}

.footer-plug {
	margin-top: 2.5rem;
	padding-top: 1.75rem;
	text-align: right;
	color: gray;
	border-top: 1px dashed silver;
}

.footer-plug a {
	font-size: 1.2rem;
}

.navbar, .sidebar {
	/* display: inline-block; */
	float: left;
	width: 12rem;
	border-width: 0;
	border-color: #cccccc;
	border-style: solid;
	border-right-width: 1px;
	margin-right: 1rem;
}

.navbar.float-right, .sidebar.float-right {
	float: right;
	border-width: 0;
	border-left-width: 1px;
}

.navbar > .navbar {
	display: block;
	border-bottom-width: 1px;
	margin-bottom: 0.75rem;
}

.navbar a {
	display: block;
	margin: 0.25rem;
}

@media (max-width: 50rem) {
	.navbar, .navbar.float-right, .sidebar, .sidebar.float-right {
		float: none;
		width: 100%;
		display: block;
		border-width: 0;
		border-bottom-width: 1px;
		margin: 0;
		margin-bottom: 1rem;
	}

	.navbar > .navbar {
		display: block;
		border-width: 0;
		border-right-width: 1px;
		margin: 0;
		margin-right: 0.75rem;
	}

	.navbar a {
		font-size: 1.25rem;
		display: inline-block;
	}

	.navbar a:before {
		content: "● ";
	}

	.navbar a:after {
		content: "";
	}

	.navbar #logo {
		display: none;
	}
}


/*****************
  SOCIAL BUTTONS
*****************/

a.facebook {
	display: inline-block;
	background-color: #29447e;
	background-image: url("http://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/F_icon.svg/22px-F_icon.svg.png");
	height: 1.3rem;
	padding: 0px;
	margin-top: 0.5rem;
	text-decoration: none;
	border: 1px solid #1a356e;
	min-width: 1.3rem;
	cursor: pointer;
}

a.facebook:hover {
	/* opacity: .9;
	filter: alpha(opacity=90); */
}

a.facebook span {
	background-color: #5f78ab;
	/* border-top: 1px solid #879ac0; */
	/* border-bottom: 1px solid #1a356e; */
	border-width: 0px;
	border-left: 1px solid #1a356e;
	color: white;
	cursor: pointer;
	display: block;
	font-size: 1.1rem;
	height: 1.3rem;
	font-weight: bold;
	margin: 0px 0px 0px 1.4rem;
	padding: 1px 6px;
}


/******************
  ROUNDED CORNERS
******************/

.container {
	position: relative;
	color: #000000;
	background-color: #ffffff;
	padding: 4px;
	border: 1px #cccccc solid;
}

.cover {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
}

div {
}

div.p, .p-bullet {
	margin: .75em;
	margin-bottom: 2em;
	text-align: justify;
	font-size: 1rem;
	line-height: 1.5rem;
}

div.corner {
	position: absolute;
	width: 4px;
	height: 4px;
	border: 0px;
	margin: 0px;
	padding: 0px;
	background-attachment: scroll;
	background-image: url(/images/circle.png);
	overflow: hidden;
}

div.top_left {
	top: -1px;
	left: -1px;
	background-position: 0px 0px;
}

div.top_right {
	top: -1px;
	right: -1px;
	background-position: 4px 0px;
}

div.bottom_left {
	bottom: -1px;
	left: -1px;
	background-position: 0px 4px;
}

div.bottom_right {
	bottom: -1px;
	right: -1px;
	background-position: 4px 4px;
}


/*****************
  STANDARD BLURB
*****************/

.p-bullet {
	float: left;
	margin-bottom: 20px;
}

.p-bullet img {
	margin: 0px 30px;
}

.p-bullet div {
	margin: 0px 10px;
	color: #555555;
}

.p-bullet-head {
	display: block;
	text-align: center;
	padding: 0px;
	margin: 0px 0px 12px 0px;
	color: #333333;
	text-shadow: #cccccc 2px 2px 3px;
}


/**********************
  SEMANTIC COMPONENTS    (NEEDS PRUNING/REORG/RENAMING/ETC.)
**********************/

.grid {
	border-collapse: collapse;
	margin: 2em;
	color: gray;
}

.grid tr:hover {
	color: black;
}

.grid tr td {
	padding: 10px;
	vertical-align: top;
}

.grid tr td:first-child {
	border-right: 1px solid #d0d0d0;
	text-align: right;
	font-size: 16px;
	font-weight: bold;
}

.header {
	margin: 8px 0px;
	padding-right: 8px;
	border-bottom: 0px dotted #cccccc;
	text-align: right;
	text-decoration: none;
	font-size: large;
	color: #006600;
}

.de-emphasized, .deemphasized {
	opacity: 0.65;
	filter: alpha(opacity=65);
}

.blessed {
	color: #daa520; /* goldenrod */
}

.holy {
	color: #ffd700; /* gold */
}

.halo {
	text-shadow: 0px 0px 6px #ffff00;
}

.distinct {
	background-color: #ffffff;
	border: 1px solid #cccccc;
	padding: 3px;
	vertical-align: middle;
	margin: 0px 1% 5px 3%;
}

.place-image, .distinct.place-image {
	margin: 20pt auto 20pt;
	display: block;
}

.google_bar {
	margin: 10px auto;
	width: 470px;
}


.toggleable_button {
	border: 1px solid #444444;
	background-color: #f0f0f0;
	padding: 5px;
	font-size: 12pt;
	font-weight: bold;
	cursor: pointer;
}


.toggleable_button:hover {
	background-color: #fcfcfc;
}


.toggleable_button:active {
	color: red;
}


.toggleable_button[disabled='disabled'] {
	border: 1px solid #888888;
	background-color: #e0e0e0;
	color: #888888;
	cursor: default;
}

.spaced li {
	margin-bottom: 25px;
}

.img_overlay {
	position: relative;
	padding: 0px;
}

.img_overlay .base {
	width: 100%;
	margin: 0px;
}

.img_overlay .overlay {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	margin: 0px;
	opacity: 0.7;
	filter: alpha(opacity=70);
}

.padded {
	padding: 10px 20px;
}

.spaced {
	margin: 10px 20px;
}

.gentle_call_to_action {
	padding: 0em 3em;
	margin-top: 3em;
	color: #777777;
}

.gentle_call_to_action a {
	text-decoration: underline;
	font-weight: bold;
}

.something_line {
	font-size: 13px;
	color: #333333;
	border-bottom: 1px dashed #dddddd;
	padding: 3px;
	margin: 0px 10px;
}

.decoration {
	vertical-align: middle;
	text-align: center;
	font-size: 24px;
}

.fact_sheet {
	float: left;
	width: 550px;
	margin: 15px;
}

.fact {
	clear: left;
	border-bottom: 1px solid silver;
	margin-bottom: 25px;
}

.fact_name {
	float: left;
	font-weight: bold;
}

.fact_description {
	font-style: italic;
	color: #a0a0a0;
	text-align: right;
}

.fact_data {
	clear: left;
}

.box-1-of-2 {
	display: inline-block;
	vertical-align: top;
	width: 45%;
	margin: 0.75%;
	padding: 0.75%;
}

.search, .explore {
	border: 3px solid #ccddee;
	background-color: #f8faff;
	opacity: 0.85;
	font-size: 12px;
	height: 64px;
}

.search img, .explore img {
	float: right;
	width: 64px;
	height: 64px;
}

.notable {
	font-size: 18px;
	text-shadow: 1px 1px 2px #bbbbbb;
}

.modal {
	position: fixed;
	display: table-cell;
	text-align: center;
	vertical-align: middle;
	overflow: hidden;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	margin: 0;
	padding: 1em 0 0 0 ;
	background-color: #ffffff;
	opacity: 0.8;
	filter: alpha(opacity=80);
}

.top {
	position: absolute;
	top: 0px;
}

.right {
	position: absolute;
	right: 0px;
}

.overlay {
	background-color: #ffffff;
	opacity: 0.75;
	filter: alpha(opacity=75);
}


/********************
  JOBS / JUBMPLISTS
********************/

.job_jumplist_container {
}

.job_jumplist {
}

.job_jumplist li {
}

.job_container {
}

.job {
	border-bottom: 1px solid #e5e5e5;
}

.job h3 {
}

.job_title {
	font-family: Times New Roman, serif;
	font-size: large;
}

.job_description {
}

.job_footer {
	text-align: right;
	padding: 0.5rem;
}

.job_footer a {
}

.job_footer a:hover {
}

.job_top_link {
	margin-left: 20px;
}

.job_section {
}

.job_section h4 {
}

.job_section ul {
	font-size: 0.8rem;
}

.job_section ul li {
}


/********************
  PROVERBS/WISE MAN
********************/

.proverb_leadin {
	font-family: Courier, monospace;
	color: #888888;
	padding-bottom: 0.5rem;
}

.proverb_table {
	width: 95%;
	margin: 2rem auto;
	border-width: 1px 0px 1px 0px;
	border-color: silver;
	border-style: solid;
	background-color: #f0f5ff;
}

.proverb_util {
	text-align: left;
}

.proverb_social, .proverb_social * {
	text-align: left;
	width: 8rem;
}

.mark {
	font-size: 3rem;
	font-weight: bold;
	color: #bbbbbb;
}

.left_quote {
	vertical-align: top;
}

.right_quote {
	vertical-align: bottom;
}

.proverb_text {
	width: 450px;
	padding: 10px auto;
	font-family: "Times New Roman", times, serif;
	font-size: 20px;
}

.proverb_text textarea {
	width: 450px;
	margin: 0px auto;
	display: block;
	height: 150px;
}

.wiseman_footer {
	font-weight: bold;
	margin: 10px auto;
	padding: 10px;
	/* border: 1px solid silver; */
	/* background-color: #ffffff; */
}



.action_link {
	color: #a02020;
}

.error {
}



/*********************
  CHALLENGE STATUSES
*********************/

.challenge_box {
	width: 100%;
	border: 1px solid #ffcccc;
	background-color: #fff5f5;
	padding: 5px;
	margin: 5px;
}

.challenge_accepted {
	border: 1px solid #ffaaaa;
	background-color: #fff0f0;
	opacity: 0.75;
	filter: alpha(opacity=75);
}

.challenge_completable {
	border: 1px solid #aaf0aa;
	background-color: #f0f9f0;
}

.challenge_completed {
	border: 1px solid #aaf0aa;
	background-color: #f0f9f0;
	opacity: 0.5;
	filter: alpha(opacity=50);
}

.challenge_cannot_accept {
	border: 1px solid #ffaaaa;
	background-color: #fff0f0;
	opacity: 0.5;
	filter: alpha(opacity=50);
}

.challenge_repeatable {
	border: 1px solid #aaccff;
	background-color: #e5f0ff;
}

.challenge_deleted, .challenge_withdrawn {
	border: 1px solid #aaaaaa;
	background-color: #e5e5e5;
	opacity: 0.5;
	filter: alpha(opacity=50);
}

.challenge_box_icon {
	float: left;
}

.notifications {
	position: fixed;
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

.tool {
	position: relative;
	cursor: default;
}

.tip {
	position: absolute;
	top: 20px;
	left: 0px;
	display: none;
	z-index: 100;
}

.tool:hover .tip {
	display: block;
}

tpdc\:comments {
	display: block;
	font-size: 12px;
	margin-top: 20px;
}


/********************
  NOTICES/REMINDERS
********************/

.notice {
	margin: 10px;
	padding: 5px;
	border-width: 2px;
	border-style: dashed;
	width: 97%;
}

.reminder {
	margin: 10px;
	padding: 5px;
	border-width: 1px;
	border-style: solid;
	width: 97%;
}

.gentle {
	color: #005500;
	border-color: #008800;
	background-color: #e5ffe5;
}

.urgent {
	color: #bb0000;
	border-color: #880000;
	background-color: #ffeeee;
}

.super-point {
	font-weight: bold;
	border-bottom: 1px solid silver;
}

.sub-point {
	color: black;
	font-size: smaller;
}


/*********
  EVENTS
*********/

.events {
	width: 240px;
	margin-left: 15px;
	padding-left: 10px;
	border-left: 1px dashed silver;
	text-align: left;
	float: right;
}

.events-medium {
	/* clear: left; */
}

.event, .event_alt, .event-big {
	position: relative;
	font-size: 12px;
}

.event-big table {
	width: 100%;
}

.event-medium {
	border-bottom: 1px solid #f0f0f0;
	margin-bottom: 10px;
	position: relative;
	font-size: 12px;
	padding: 10px 0px;
}

.event-medium table {
	width: 90%;
}

.event-medium .event-username {
	font-weight: bold;
	display: block;
}

.event-icon {
}

.event-icon-td {
	width: 55px;
	padding: 3px;
	vertical-align: top;
}

tpdc\:comments.event-comments {
	margin-top: 5px;
}

tpdc\:comments.event-comments b {
	font-weight: normal;
	color: #aaaaaa;
}


.event_alt {
	background-color: #eeeeee;
}

a.event-link {
	text-decoration: none;
}

.event-menu {
	position: absolute;
	font-weight: bold;
	top: 0px;
	right: -14px;
	width: 14px;
	height: 14px;
	font-size: 14px;
	opacity: 0.1;
	filter: alpha(opacity=10);
	border: 0px solid silver;
	padding: 0px;
	line-height: 12px;
}

.event:hover .event-menu, .event_alt:hover .event-menu, .event-medium:hover .event-menu {
	opacity: 1;
	filter: alpha(opacity=100);
}

.event-big .event-menu {
	display: none;
}

/******************
    SCORE CARDS
******************/

.game-square {
	display: block;
	border: 1px solid black;
	margin: 1.1rem auto;
	width: 30rem;
	height: 30rem; 
}

tpdc\:resultcard {
	display: block;
	border: 15px solid #fce890;
	padding: 15px;
	margin: 15px;
}

.result-title {
	text-align: center;
	margin: 0px;
	color: #aa3939;
}

.result-result {
	text-align: center;
	color: #3399cc;
	border: 2px dashed #99ccee;
	border-radius: 10px;
	padding: 1em;
}

.result-description {
	text-align: left;
}

.result-follow {
	text-align: center;
	margin-top: 2em;
	padding-top: 1em;
	border-top: 1px dotted silver;
	vertical-align: bottom;
}

.result-follow span {
	color: #bb3333;
	font-weight: bold;
}

.result-buttons {
	padding-top: 1em;
}

.fb-like {
	vertical-align: top;
}

.twitter-follow {
	vertical-align: top;
	display: inline-block;
}

tpdc\:newsletter {
	display: inline-block;
}


/******************
   SHARE BUTTONS
******************/

tpdc\:share {
	display: block;
	text-align: center;
	color: gray;
	font-size: 22px;
}

.social-link {
	cursor: pointer;
}

.social-icon {
	height: 22px;
	vertical-align: text-top;
}


/*******************
   PROPERTY LIST
*******************/

.property-group {
	margin: 8px auto 18px auto;
}

.property-group .property-group {
	margin-top: 12px;
}

.propertylist {
	border: 1px solid silver;
}

.propertylist tr td {
	padding: 5px;
}

.propertylist tr.a td {
	background-color: #ffffff;
}

.propertylist tr.b td {
	background-color: #ffffe0;
}


/*******************
    USER PROFILE
*******************/

.bio {
	margin-bottom: 2rem;
}

.bio_text {
	padding: 0.5rem;
	margin: 0.5rem;
	margin-top: 1.5rem;
	border: 1px solid #77aa77;
	background-color: #f5fff5;
}

.bio_image {
	text-align: center;
	width: 200px;
	/* height: 200px; */
	margin: 10px auto;
}


/*******************
     OPACITIES
*******************/

.opacity-35 {
	-ms-filter:"progid:DXImageTransform.Microsoft.Alpha(Opacity=35)";
	filter: alpha(opacity=35);
	opacity: 0.35;
}


/**************
  TPDC SIMPLE
**************/

tpdc\:template {
	display: none;
}

tpdc\:voter {
}

tpdc\:vote {
}

tpdc\:unvote {
	color: silver;
}


/*************************
  LINKED PLACES + THINGS
*************************/

tpdc\:placenavigation {
	display: block;
}

tpdc\:placenavigation .nav-signal {
	display: inline-block;
	opacity: 0.75;
	font-size: 20pt;
}

tpdc\:placenavigation .places {
	display: inline-block;
	width: 250px;
	vertical-align: middle;
	text-align: right;
	margin-right: 0px;
	padding-right: 0px;
}

tpdc\:linkedplace, tpdc\:addlinkedplace, tpdc\:thing {
	position: relative;
	display: inline-block;
	max-width: 125px;
	padding: 3px;
	border: 1px solid #cccccc;
	margin: 2px;
	vertical-align: top;
	text-align: center;
	font-size: 10pt;
}

tpdc\:linkedplace, tpdc\:addlinkedplace {
	width: 110px;
	height: 75px;
	opacity: 0.75;
	filter: alpha(opacity=75);
	transition: opacity 0.35s, filter 0.35s;
	-webkit-transition: opacity 0.35s, filter 0.35s; 
}

tpdc\:linkedplace a:hover {
	text-decoration: none;
}

tpdc\:linkedplace:hover, tpdc\:addlinkedplace:hover {
	opacity: 1;
	filter: alpha(opacity=100);
}

tpdc\:addlinkedplace {
	width: 110px;
}

tpdc\:things {
	display: inline-block;
}

tpdc\:things .tg-drop-spot {
	display: none;
}

tpdc\:thing {
	width: 100px;
	font-size: 11px;
}

tpdc\:thing .overlay {
    font-size: 1.1rem;
    background-color: white;
    color: #8B0000;
    font-weight: bold;
    opacity: 0.85;
	filter: alpha(opacity=85);
}

tpdc\:thing icon {
}

tpdc\:thing icon img {
	width: 64px;
	height: 64px;
}

.thing-icon {
	max-width: 33%;
	max-height: 33%;
}

tpdc\:pointclickergame {
	display: block;
	text-align: center;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;
}

tpdc\:pointclickergame > * {
	margin: 0.5em;
}

tpdc\:pointclickergame *.inactive{
	opacity: 0.25;
	filter: alpha(opacity=25);
}

tpdc\:pointclicker {
	position: relative;
	display: inline-block;
	border: 1px solid silver;
	padding: 0.5em;
	font-size: 2rem;
	cursor: pointer;
	background-color: white;
}

tpdc\:pointclicker:hover {
	background-color: lightblue;
	color: white;
}

tpdc\:pointclicker:active {
	background-color: red;
	color: white;
}

tpdc\:signinplea {
	display: block;
}


/********************
  TDPC FANCY BUTTON
********************/

tpdc\:roughedge, .tpdc-roughedge {
	display: inline-block;
	position: relative;
	width: 10rem;
	margin: 0.35rem;
}

.rough-edge {
	position: relative;
	padding: 0.5rem;
	transition: background-color ease-out 0.35s;
	-webkit-transition: background-color ease-out 0.35s;
}

.rough-edge.red:hover {
	background-color: #ffd0d0;
}

.rough-edge.green:hover {
	background-color: #d0ffd0;
}

.rough-edge.yellow:hover {
	background-color: #ffffc0;
}

.rough-edge.blue:hover {
	background-color: #e0e5ff;
}

.horizontal.edge {
	background-image: url('/images/rough-edge-horizontal.png');
	height: 1.5rem;
	width: 100%;
	left: 0px;
}

.top.edge {
	top: 0px;
}

.bottom.edge {
	bottom: 0px;
	background-position: 0px 1.5rem;
}

.vertical.edge {
	background-image: url('/images/rough-edge-vertical.png');
	height: 100%;
	width: 1.5rem;
}

.right.edge {
	background-position: 1.5rem 0px;
	top: 0px;
	right: 0px;
}

.left.edge {
	background-position: 0px 0px;
	top: 0px;
	left: 0px;
}

.edge {
	position: absolute;
	z-index: 5;
	opacity: 0.50;
	filter: alpha(opacity=50);
}

.rough-edge-content {
	z-index: 10;
	position: relative;
}

.block-link {
	display: block;
	color: black;
	font-weight: bold;
	font-family: Times New Roman, serif;
	text-decoration: none;
	text-align: center;
	margin: 0px;
	width: 100%;
	height: 100%;
}


/********************
    RARITY COLORS 
********************/

.rarity {
	font-weight: bold;
}

.mythical {
	color: #d0b000;
}

.legendary {
	color: #cc7700;
}

.epic {
	color: #8844cc;
}

.rare {
	color: #3366aa;
}

.uncommon {
	color: #448844;
}

.common {
	/* default */
}

.ubiquitous {
	color: #888888;
}
