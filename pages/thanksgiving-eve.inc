<?php
	$meta_title = "Happy Thanksgiving Eve";
?>
Facebook may not properly recognize the eve of American Gluttony Day, but thepointless.com does.

<div style='text-align: center; margin-bottom: 20px;'>
<img src='/images/thanksgiving_turkey.jpg' alt='the thanksgiving eve turkey' title='cluck cluck' />
<br /><a class='facebook' href='javascript:fb_publish();'><span>Happy Thanksgiving Eve</span></a>
</div>

<script type='text/javascript'>
	    function fb_publish() {
        FB.ui(
            {
                'method':'stream.publish',
                'message':'',
                'attachment': {
                    'name': 'Happy Thanksgiving Eve',
                    'description': (
						'Facebook may not properly recognize the eve of American Gluttony Day, but thepointless.com does.'
                    ),
                    'href': '<?php print $base_url; ?>thanksgiving-eve',
                    'media': [
                        {
                            'type': 'image',
                            'href': '<?php print $base_url; ?>thanksgiving-eve',
                            'src': '<?php print $base_url; ?>images/thanksgiving_turkey.jpg'
                        }
                    ]
                },
                'user_message_prompt': 'Spread the gluttony!'
            },
            function(fb_response) {
                if (fb_response && fb_response.post_id) {
                    // post published
                    _gaq.push(['_trackEvent', 'Social Media', 'FB Publish', 'thanksgiving eve share', ]);
                } else {
                    // post not published
                }
            }
        );
    } // fb_publish()
</script>
