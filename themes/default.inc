<?php
	require_once('includes/game-inserts.inc');
	require_once('includes/sitemap.inc');
?>
<!doctype html>
<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc" xmlns:fb="http://www.facebook.com/">
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<?php

	// Google Analytics AB Experiments

	if (@$analytics_experiment_id && @$run_experiments) {
		$analytics_experiment = <<<EXP
<!-- Google Analytics Content Experiment code -->
	<script>function utmx_section(){}function utmx(){}(function(){var
	k='{$analytics_experiment_id}',d=document,l=d.location,c=d.cookie;
	if(l.search.indexOf('utm_expid='+k)>0)return;
	function f(n){if(c){var i=c.indexOf(n+'=');if(i>-1){var j=c.
		indexOf(';',i);return escape(c.substring(i+n.length+1,j<0?c.
length:j))}}}var x=f('__utmx'),xx=f('__utmxx'),h=l.hash;d.write(
'<sc'+'ript src="'+'http'+(l.protocol=='https:'?'s://ssl':
'://www')+'.google-analytics.com/ga_exp.js?'+'utmxkey='+k+
'&utmx='+(x?x:'')+'&utmxx='+(xx?xx:'')+'&utmxtime='+new Date().
valueOf()+(h?'&utmxhash='+escape(h.substr(1)):'')+
'" type="text/javascript" charset="utf-8"><\/sc'+'ript>')})();
</script><script>utmx('url','A/B');</script>
<!-- End of Google Analytics Content Experiment code -->

EXP;
		print $analytics_experiment;
	}

?>
	<title><?php print $meta_title; ?> - thepointless.com</title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="keywords" content="<?php print $meta_keywords;?>" />
	<meta name="description" content="<?php print $meta_description;?>" />
	<?php if (isset($extra_meta_tags)) { print $extra_meta_tags; } ?>
	<meta name="google-site-verification" content="zYKsu_Prv58mFQyRGJA3j1sDsQzAytFhE2SjFMaQk14" />
	<link rel='stylesheet' type='text/css' href='/sheets/default.css?v=<?php print $general_version; ?>' />
	<link rel='shortcut icon' href='/images/favicon.ico?v=<?php print $general_version; ?>' />
	<?php include('includes/google_analytics.inc'); ?> 
	<script type='text/javascript' src='//<?php print $trulygui_host; ?>/js/tg-all.js?v=<?php print $general_version; ?>'></script>
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
				<h2><?php print $html_title; ?></h2>
			</div>

			<div id="template_page_data">
				<?php
					print $template_page_data;
				?>
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

		<!-- |\/|4d3 \/\/1+|-| \/1 -->
		<div id='sub-footer'>
			This page was hand-knit in <?php print time_elapsed(); ?> seconds by enslaved children.
			<br /><br />
			<a href='/y2k'>&copy;<?php print date('Y', strtotime('-100 years')); ?></a>
			| <a href='/terms'>terms</a>
			| <a href='/careers'>careers</a>
			| <a href='/all-the-stuff'>meh</a>
			| <a href='/about'>about</a>
			<div style='color: #bbbbbb; margin-top: 3em;'><a href='/myip'><?php print $_SERVER['REMOTE_ADDR']; ?></a></div>
		</div>


	</div>

<div id='fb-root'></div>
<script type='text/javascript' src='/ajax/api?v=<?php print $general_version; ?>'></script>
<script type='text/javascript' src='/js/tpdc.js?v=<?php print $general_version; ?>'></script>
<script type='text/javascript'>
<?php

	allow_award(award_cap("Social Butterfly", 1, 30));

	$award_token = isset($award_token) ? $award_token : '';
	print "TPDC.award.t = " . json_encode($award_token) . ";\n";

	if ($u = get_authenticated_user()) {
		$pu = trim_user_fat($u);
		print "TPDC.authenticatedUser = " . json_encode($pu) . ";\n";
	}

	print tpdc_notifications_js();

?>
</script>

<!--
	<?php
		if (isset($request_query_count)) {
			print "{$request_query_count}\n{$request_query_time}";
			print "\n" . $request_query_count / $request_query_time;
			print "\n" . $request_query_time / $request_query_count;
		}
	?>

-->

</body>
</html>
