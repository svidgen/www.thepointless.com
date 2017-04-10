<?php

	$meta_title = "online pregnancy test";

	require_once('includes/game.inc');
	allow_awards(array(
		inventory_cap('Pregnancy Test Result', 3),
		inventory_cap('Inconclusive Test Result', 3)
	));

?>

<style type='text/css'>

	.testbutton {
		display: inline-block;
		cursor: pointer;
		border: 0.25rem solid #f5d0d0; 
		background-color: #f0f5ff;
		margin: 2rem auto 4rem;
		padding: 0.75rem;
		text-align: center;
		font-weight: bold;
	}

	.testbutton:hover {
		background-color: white;
	}

	.testcontainer {
		margin: 1.5rem auto;
		padding: 2rem;
		border: 2px solid #d0d5ff;
		max-width: 450px;
		max-height: 52px;
	}

	.testcontainer img {
		width: 100%;
		height: 100%;
	}

</style>

<script type='text/javascript'>
	var think_div = false;

	function dotest() {
		if (think_div) {
			return true;
		}
		
		think_div = document.createElement('div');
		think_div.innerHTML = "Just a sec ...<br /><br /><img src='/images/please_wait.gif' />";
		think_div.style.fontSize = '3rem';
		think_div.className = 'modal';
		document.body.appendChild(think_div);

		var submittimeout = setTimeout(
			function() {
				think_div.innerHTML = "No urine detected!<br /><br />Please <a href='javascript:clearresult();'>try again</a>.";
				TPDC.awardMultiple([
					{quantity: 1, item: 'Pregnancy Test Result'},
					{quantity: 1, item: 'Inconclusive Test Result'}
				]);
			},
			4000
		);

		return false;
	} // dotest()


	function clearresult() {
		if (think_div) {
			document.body.style.overflow = "scroll";
			think_div.parentNode.removeChild(think_div);
			think_div = false;
		}
	} // clearresult()


	function setColor(id, color) {
		var n = document.getElementById(id);
		if (n) {
			n.style.color = color;
		}
	} // setColor()


	    function fb_publish() {
        FB.ui(
            {
                'method':'stream.publish',
                'message':'',
                'attachment': {
                    'name': 'online pregnancy test',
                    'caption': 'pregnancy testing in the cloud',
                    'description': (
                        'Using the sensors in your keyboard or mobile device, we are now able to remotely triangulate your hormone levels and detect the faint, early indicators of pregnancy.'
                    ),
                    'href': '<?php print $base_url; ?>preggertest',
                    'media': [
                        {
                            'type': 'image',
                            'href': '<?php print $base_url; ?>preggertest',
                            'src': '<?php print $base_url; ?>images/preggertest.png',
                        }
                    ]
                },
                'action_links': [
                    {'text': 'Take the test!', 'href': '<?php print $base_url; ?>preggertest'}
                ],
                'user_message_prompt': 'Share the new technology!'
            },
            function(fb_response) {
                if (fb_response && fb_response.post_id) {
                    // post published
                    _gaq.push(['_trackEvent', 'Social Media', 'FB Publish', 'preggertest share', ]);
                } else {
                    // post not published
                }
            }
        );
    } // fb_publish()
</script>

<div>Using the sensors in your keyboard, we are now able to remotely triangulate your hormone levels and detect the faint, early indicators of pregnancy.</div>
<div class='testcontainer'>
	<img src='/images/preggertest.png' style='border: 0px; margin: 0px;' />
</div>
<div>It's easy:
	<ol>
		<li>Just <b>urinate</b> on your keyboard or mobile device. <a href='#footnote_1' style='cursor: pointer; font-weight: bold;' onmouseover="setColor('footnote_1', '#cc0000');" onmouseout="setColor('footnote_1', 'gray');">*</a></li>
		<li>Wait <b>2 minutes</b>.</li>
		<li>Click the <b>Am I Preggerz?</b> button.</li>
		<li><i>Disregard all results reported after 5 minutes!</i></li>
	</ol>
</div>
<div style='text-align: center;'>
	<div class='testbutton' onclick='dotest();'>Am I Preggerz?</div>
</div>
<div style='margin: 30px auto; text-align: center;'>
	<a class='facebook' href='javascript:fb_publish();'><span>Share</span></a>
</div>
<div id='footnote_1' style='color: gray; font-size: small;'><b>*</b> If it is physically difficult for you to urinate on your keyboard or mobile device, you may also submerge it in a urine-filled toilet.</div>
