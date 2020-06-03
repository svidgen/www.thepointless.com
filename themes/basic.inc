<?php
	require_once('includes/game-inserts.inc');
	require_once('includes/sitemap.inc');
?>
<!doctype html>
<html xmlns:tpdc="http://www.thepointless.com/ns/tpdc" xmlns:fb="http://www.facebook.com/">
<head>
	<title><?php print $args['meta_title']; ?></title>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=EDGE" />
	<meta name="keywords" content="<?php print $args['meta_keywords'];?>" />
	<meta name="description" content="<?php print $args['meta_description'];?>" />
	<?php if (isset($args['extra_meta_tags'])) { print $args['extra_meta_tags']; } ?>
	<meta name="google-site-verification" content="zYKsu_Prv58mFQyRGJA3j1sDsQzAytFhE2SjFMaQk14" />
	<link rel='shortcut icon' href='/images/favicon.ico?v=<?php print $general_version; ?>' />
	<link rel='manifest' href='<?php print @$args['manifest']; ?>' />
	<?php include('includes/google_analytics.inc'); ?> 
	<script type='text/javascript' src='/js/tg-all.js?v=<?php print $general_version; ?>'></script>
</head>
<body id="thebody">

	<div id='notifications' class='notifications'></div>
	<div id="content">
		<?php print $args['content']; ?>
	</div>


	<!--
	<?php print_query_stats(); ?>
	-->

</body>
</html>
