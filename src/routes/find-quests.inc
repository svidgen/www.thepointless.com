<?php

	$meta_title = "finding quests";
	require_once('includes/game-inserts.inc');
	enable_comments();

?>
<div>
	At certain times, visitors to thepointless.com may be permitted to challenge others with <b>quests</b>.
	Currently, there are three ways you can find these quests:
	<ul>
		<li>Find the user's profile page.</li>
		<li>Get one <b>directly from the user</b> via facebook, email, a forum, etc.</li>
		<li><b>Peruse the site.</b> Look for things like this:
			<div style='margin: 10px;'>
				<?php
					$challenges = select_challenges(
						array(
							'enabled' => 1,
							'user_id!=' => get_user_id()
						),
						array(
							'limit' => 1
						)
					);
					print challenge_box($challenges[0]);
				?>
			</div>
		</li>
	</ul>
</div>
<div>
	<b>And, there are a couple more things to note:</b>
	<ul>
		<li>A user's challenges must be accepted and completed in the order they were created.</li>
		<li>If you find a quest you're not yet eligible to accept, you will be directed to the user's profile page, where you can find the prerequisite challenges.</li>
	</ul>
</div>
