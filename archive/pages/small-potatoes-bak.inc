<?php

	$html_title = "the book of small potatoes";
	$meta_title = "{$html_title} - wisdom of the ancients";

	$voter_token = add_token('vote');

	$sort_options = array(
		'Latest', 'Popular', 'Trending', 'Random'
	);
	$sort_selected = false;

	if (isset($_GET['id'])) {
		$sort_selected = 'None';
		$rows = array();
		if ($row = select_proverb($_GET['id'])) {
			$rows[] = $row;
			$total_rows = 1;
		} else {
			$total_rows = 0;
		}

		if (sizeof($rows) > 0) {
			$meta_description = htmlsafe("A wise man once said, \"{$rows[0]['proverb_text']}\"");
		} else {
			$meta_description = "A wise man once said ... ";
		}

		//
		// set up meta tags for facebook stuff
		//
		$extra_meta_tags = "
			<meta property=\"og:title\" content=\"the book of small potatoes - wisdom of the ancients\" />
			<meta property=\"og:type\" content=\"article\" />
			<meta property=\"og:url\" content=\"{$_SERVER['SCRIPT_URI']}?id={$_GET['id']}\" />
			<meta property=\"og:image\" content=\"{$base_url}images/big_giant.jpg\" />
			<meta property=\"og:site_name\" content=\"thepointless.com\" />
			<meta property=\"fb:admins\" content=\"8643372\" />
			<meta property=\"ob:description\" content=\"{$meta_description}\" />
		";

	} elseif (isset($_GET['sort']) && $_GET['sort'] == 'Random') {
		$rows = select_random_proverbs('small-potato', 5);
		$total_rows = 5;
	} elseif (isset($_GET['sort']) && $_GET['sort'] == 'Popular') {
		$rows = select_popular_proverbs('small-potato', @$_GET['s']);
		$total_rows = select_proverbs_count(array('type' => 'small-potato'));
	} elseif (isset($_GET['sort']) && $_GET['sort'] == 'Trending') {
		$rows = select_trending_proverbs('small-potato', @$_GET['s']);
		$total_rows = select_trending_proverbs_count('small-potato');
	} else {
		$sort_selected = "Latest";
		$rows = select_proverbs(array('type' => 'small-potato'), @$_GET['s']);
		$total_rows = select_proverbs_count(array('type' => 'small-potato'));
	}


	if ($total_rows < 1) {
		header("HTTP/1.1 404 Not Found");
		$meta_title = "potato not found";
		$html_title = "potato not found";
		print "Return to the <a href='?'>main listing</a>.";
		return 1;
	}

	$rows_html = array();
	foreach ($rows as $k => $row) {
		$rows_html[] = proverb_html($row);
	}
	$rows_html = join("\n", $rows_html);


	if ($total_rows > $proverbs_page_size) {
		$result_pager = "<div style='font-size: large; text-align: center;'>"
			. result_pager(
				array(
					'page' => @$_GET['s'],
					'page_var' => 's',
					'total_pages' => ceil($total_rows / $proverbs_page_size),
					'divider' => '&nbsp;&nbsp;',
					'first' => '&lt;~~',
					'previous' => '&lt;~',
					'next' => '~&gt;',
					'last' => '~~&gt;'
				)
			)
		. "</div>\n";
	} else {
		$result_pager = '';
	}


	function proverb_html($row) {
		global $base_url;
		$t = htmlsafe($row['proverb_text']);
		return "<table class='proverb_table'>
			<tr>
				<td colspan='3' class='proverb_leadin'>
					<a href='?id={$row['proverb_id']}' style='color: gray;'>#</a>
					A wise man once said, 
				</td>
			</tr>
			<tr>
				<td class='left_quote mark'>&ldquo;</td>
				<td class='proverb_text'>{$t}</td>
				<td class='right_quote mark'>&rdquo;</td>
			</tr>
			<tr>
				<td colspan='3'>
					<table style='width: 100%;'>
						<tr>
							<td class='proverb_util'>
								<tpdc:voter method='/ajax/vote' record_id='{$row['proverb_id']}' vote='{$row['user_vote']}' fb_like_url='{$_SERVER['SCRIPT_URI']}?id={$row['proverb_id']}'>
									<tpdc:vote>vote</tpdc:vote>
									<tpdc:unvote>unvote</tpdc:unvote>
									+<tpdc:count>{$row['likes']}</tpdc:count>
								</tpdc:voter>
							</td>
							<td class='proverb_social'>
								<div class=\"fb-share-button\" data-href=\"{$_SERVER['SCRIPT_URI']}?id={$row['proverb_id']}\" data-type=\"button_count\"></div>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
		";
	} // proverb_html()

?>
<div style='float: left;'>
	<div class='fb-like' data-href='<?php print $_SERVER['SCRIPT_URI']; ?>' data-send='true' data-layout='button_count' data-width='140' data-show-faces='false'></div>
</div>
<h5 style='text-align: right; margin-right: 18px; margin-top: -18px; color: silver;'>Wisdom of the Ancients</h5>


<div style='margin-top: 35px; text-align: right;'>
	<a href='/add-potato'>Contribute Your Wisdom</a>
</div>

<div><?php
	print sort_selector($sort_options, 'sort', $sort_selected);
?></div>

<?php
	print $rows_html;
	print $result_pager;
?>

<script type='text/javascript'>
	api_token = '<?php print $voter_token; ?>';
</script>

