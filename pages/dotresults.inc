<?php

	require_once('includes/sitemap.inc');
	require_once('includes/game-inserts.inc');

	if (isset($_POST['clicks'])) {
		$clicks = (int)$_POST['clicks'];
	} else {
		$clicks = 0;
	}

	if ($clicks == 1) {
		$click_text = 'time';
		$click_click_text = 'click';
	} else {
		$click_text = 'times';
		$click_click_text = 'clicks';
	}

	if (isset($_POST['dot'])) {
		$dot = $_POST['dot'];
	} else {
		$dot = '';
	}
	
	$meta_title = "for the love of the dot!";
	$enable_facebook = true;

	print resultcard_html(
		// "result"
		"{subject} clicked the {$dot} dot <i>{$clicks}</i> {$click_text}.",

		// image
		null,

		// title
		"Congratulations!?",

		// description
		($clicks > 0 ?
			"And {subject}'ve verified that it <i>really</i> doesn't do anything."
			: "Which means {subject}'ve escaped it's heavenly appeal, I suppose.")
		. " So ... hooray.",

		$_SERVER['HTTP_REFERER']
	);

/*
	if ($clicks == 0) {
		// print "<p>Not the dot clicking type? Have you considered <a href='/bopthegirl'>bopping the girl</a>?</p>\n";
		print "<h3>You didn't even click the thing <i>once???</i></h3>
			<div id='action_links'>You are truly awesome.</div>
		";
	} else {
		print "<div style='font-size: x-large; font-weight: bold; color: #993399;'>You clicked the <i>{$dot}</i> dot <i><u>{$clicks}</u> {$click_text}</i>!</div>
			<div>And you have found that it <i>really</i> doesn't do anything &mdash; at least not for the first {$clicks} {$click_click_text} ... </div>
			<div id='action_links' style='margin: 3em; text-align: center;'></div>
		";
	}
*/

?>



<script type='not-text/javascript'>
	document.getElementById('action_links').innerHTML += "<a href='javascript:fb_publish();' class='facebook'><span>Publish your findings on facebook!</span></a>";

	function fb_publish() {
		FB.ui(
			{
				'method':'stream.publish',
				'message':'I have confirmed that the <?php print $dot; ?> dot doesn\'t do anything.',
				'attachment': {
					'name': 'I clicked the <?php print $dot . ' dot ' . $clicks . ' ' . $click_text; ?>',
					'caption': 'the <?php print $dot; ?> dot - thepointless.com',
					'description': (
						'It has been verified that the <?php print $dot; ?> dot doesn\'t do anything &mdash; at least not for the first <?php print $clicks . ' ' . $click_click_text; ?> ...'
					),
					'href': '<?php print $base_url . $dot; ?>dot',
					'media': [
						{
							'type': 'image',
							'href': '<?php print $base_url . $dot ; ?>dot',
							'src': '<?php print $base_url; ?>images/<?php print $dot; ?>dot.jpg',
						}
					]
				},
				'action_links': [
					{'text': 'Click the dot!', 'href': '<?php print $base_url . $dot; ?>dot'}
				],
				'user_message_prompt': 'Share your awesomeness!'
			},
			function(fb_response) {
				if (fb_response && fb_response.post_id) {
					// post published
					_gaq.push(['_trackEvent', 'Social Media', 'FB Publish', '<?php print $dot; ?> dot', <?php print $clicks; ?>]);
				} else {
					// post not published
				}
			}
		);
	} // fb_publish()
</script>
