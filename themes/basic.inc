<?php
	require_once('includes/game-inserts.inc');
	require_once('includes/sitemap.inc');
?>
<!doctype html>
<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc" xmlns:fb="http://www.facebook.com/">
<head>
<?php
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
	<title><?php print $meta_title; ?></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
	<meta name="keywords" content="<?php print $meta_keywords;?>" />
	<meta name="description" content="<?php print $meta_description;?>" />
	<?php if (isset($extra_meta_tags)) { print $extra_meta_tags; } ?>
	<meta name="google-site-verification" content="zYKsu_Prv58mFQyRGJA3j1sDsQzAytFhE2SjFMaQk14" />
	<link rel='shortcut icon' href='/images/favicon.ico?v=<?php print $general_version; ?>' />
	<?php include('includes/google_analytics.inc'); ?> 
	<script type='text/javascript' src='//<?php print $trulygui_host; ?>/js/tg-all.js?v=<?php print $general_version; ?>'></script>
</head>
<body id="thebody">

	<div id='notifications' class='notifications'></div>
	<div id="content">
		<?php print $template_page_data; ?>
	</div>


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
