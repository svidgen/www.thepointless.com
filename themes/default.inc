<?php

require_once('includes/game-inserts.inc');
require_once('includes/sitemap.inc');
require_once('includes/dbconnect.inc');

?>
<!doctype html>
<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc" xmlns:fb="http://www.facebook.com/">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
	<title><?php print $args['meta_title']; ?> - thepointless.com</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="keywords" content="<?php print $args['meta_keywords'];?>" />
	<meta name="description" content="<?php print $args['meta_description'];?>" />
	<?php if (isset($args['extra_meta_tags'])) { print $args['extra_meta_tags']; } ?>
	<meta name="google-site-verification" content="zYKsu_Prv58mFQyRGJA3j1sDsQzAytFhE2SjFMaQk14" />
	<link rel='stylesheet' type='text/css' href='/sheets/default.css?v=<?php print $general_version; ?>' />
	<link rel='shortcut icon' href='/images/favicon.ico?v=<?php print $general_version; ?>' />
	<?php include('includes/google_analytics.inc'); ?> 
	<script type='text/javascript' src='/js/tg-all.js?v=<?php print $general_version; ?>'></script>
	<script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</head>
<body id="thebody">

	<div id='notifications' class='notifications'></div>

	<div id="container">

		<div class='corner top_left'></div>
		<div class='corner top_right'></div>
		<div class='corner bottom_left'></div>
		<div class='corner bottom_right'></div>
		
		<div id="sideblock" class='navbar'>

			<div id="logo">
				<a href="/index">
					<img src="/images/big_giant.png" alt="me stepping on your house" />
				</a>
			</div>

			<div class="navbar">
				<?php print getLinks('top'); ?>
			</div>

			<div class='navbar' id='user_menu'>
				<?php
					print user_menu();
				?>
			</div>

			<div class="navbar">
				<?php print getLinks('external'); ?>
			</div>

		</div>


<!--Begin page specific data-->
<!--DIV ID's available to page specific data
	content: main content-self explanatory, really
	-->

		<div id="content" class='content'>

			<div id="header" class='header'>
				<h2><?php
					if (isset($args['html_title'])) {
						print $args['html_title'];
					} elseif (isset($args['meta_title'])) {
						print $args['meta_title'];
					} else {
						print "Untitled Pointlessness";
					}
				?></h2>
			</div>

			<div id="template_page_data">
				<?php print $args['content']; ?>
			</div>

	<!--End page specific data-->

			<div style='clear: both;'></div>

		<?php
			print comments_html();
			print getPlug();
		?>

		</div> <!-- #content -->


	</div> <!-- #container -->


	<div id="footer">
		<div id='wiseman'>
			<?php include('includes/wiseinsert.inc'); ?>
		</div>

		<div id='sub-footer'>
			This page was hand-knit in <?php print time_elapsed(); ?> seconds by enslaved children.
			<br /><br />
			<a href='/y2k'>&copy;<?php print date('Y', strtotime('-100 years')); ?></a>
			| <a href='/terms'>terms</a>
			| <a href='/careers'>careers</a>
			| <a href='/all-the-stuff'>meh</a>
			| <a href='/about'>about</a>
		</div>

		<br />

	</div>

<script type='text/javascript' src='/ajax/api?v=<?php print $general_version; ?>'></script>
<script type='text/javascript' src='/js/tpdc.js?v=<?php print $general_version; ?>'></script>
<script type='text/javascript'>
<?php

	// allow_award(award_cap("Social Butterfly", 1, 30));

	// $award_token = isset($award_token) ? $award_token : '';
	// print "TPDC.award.t = " . json_encode($award_token) . ";\n";

	// if ($u = get_authenticated_user()) {
	// 	$pu = trim_user_fat($u);
	// 	print "TPDC.authenticatedUser = " . json_encode($pu) . ";\n";
	// }

	// print tpdc_notifications_js();

?>
</script>
<?php print_query_stats(); ?>
</body>
</html>
