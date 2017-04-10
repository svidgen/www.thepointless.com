<?php
	$meta_title = "some links";
?>
<script type='text/javascript'>
	window.onmessage = function(m) {
		if (parseInt(m.data) != "NaN") {
			document.getElementById('bookmarks').style.height = parseInt(m.data) + "px";
		}
	}
</script>

<div id='toggle_links'></div>
<iframe id='bookmarks' src='http://<?php print $bookmarks_host; ?>/embed_bookmarks?user=thepointlessDOTcom&amp;recent=1' style='width: 570px; height: 900px; border: 0px;' scrolling='no' seamless='seamless' onload="repop_links();"></iframe>

<script type='text/javascript'>

	var lists = [
		{
			"title":"our list",
			"url":"http://<?php print $bookmarks_host; ?>/embed_bookmarks?user=thepointlessDOTcom&recent=1",
			"details":"Links to stuff ... you click on 'em."
		},

		{
			"title":"your list",
			"url":"http://<?php print $bookmarks_host; ?>/embed_bookmarks?tags=pointless&recent=1",
			"details":"You can add to this list by adding and tagging links as <i>pointless</i> at <a href='http://<?php print $bookmarks_host; ?>/'>Svidgen</a>."
		}
	];


	var updateBookmarks = function(i) {
		document.getElementById('bookmarks').src = lists[i]["url"];
		repop_links();
	};


	var repop_links = function() {
		var links = [];
		var details = "";

		for (var i in lists) {
			if (document.getElementById('bookmarks').src == lists[i]["url"]) {
				links[links.length] = "<u>" + lists[i]["title"] + "</u>";
				if (lists[i]["details"]) {
					details = lists[i]["details"];
				}
			} else {
				links[links.length] = "<a href=\"javascript:updateBookmarks(" + i + ");\">" + lists[i]["title"] + "</a>";
			}
		}

		document.getElementById('toggle_links').innerHTML = links.join(' | ') + "<div style='font-size: small; color: #777777;'>" + details + "</div>";

		return document.getElementById('bookmarks').src;
	};

	repop_links();

</script>

