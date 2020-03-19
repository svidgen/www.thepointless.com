<?php

	function getMap($tree = null) {
		$rv = array();

		$map = array(
			'top' => array(
				'/index' => 'Home',
				'/contact' => 'Contact Me',
				'/sitemap' => 'Site Map',
			),

			'account' => array(
			),

			'external' => array(
				/*
				 * do we even still want these links here???
				 *
				'https://www.facebook.com/thepointless' => '@Facebook',
				'http://www.twitter.com/pointlessdotcom' => '@Twitter',
				'http://cafepress.com/thepointless' => '@Cafepress',
				'http://angrystickman.blogspot.com/' => '@Blogger',
				 */
				'https://www.facebook.com/thepointless' => '@Facebook',
				'https://www.angrystickman.net/' => '@AngryStickman.net',
			),

			'features' => array(
				'/features/halloweeny-2015' => 'halloweeny (2015)',
				'/falling-candy-corn' => 'falling candy corn',
				'/big-dinosaur-problem-lately' => 'big dinosaur problem lately',
				'/features/meme?name=cleaning-with-kittens' => 'a kitten meme',
				'/features/meme?name=toilet-paper-not-a-turle' => 'a toilet paper meme',
				'/dinosaur-people' => 'dinosaur people',
				'/shooty-ship/' => 'Shooty Ship (new!)',

				// including the 'id' to satisfy getPlug()
				'/place' => 'a place!',

				// '/fart-counter' => 'fart counter',
				'/awkward-moment' => "that awkward moment when ...",
				'/small-potatoes' => 'the book of small potatoes',
				'/ascii-monsters' => 'ascii monsters',
				'/preggertest' => 'online pregnancy test',
				'/something' => 'something',
				'/zebratest' => 'zebra awareness test',
				'/clickometer' => 'a clickometer',
				'/dots' => 'some dots',
			),
		);

		if ($tree == null) {
			$tree = array_keys($map);
		}

		if (is_string($tree)) {
			$tree = array($tree);
		}

		if (is_array($tree)) {
			foreach ($tree as $v) {
				if (array_key_exists($v, $map)) {
					$rv = array_merge($rv, $map[$v]);
				}
			}
		} else {
			$rv = $map;
		}

		return $rv;
	} // getMap()


	function getLinks(
		$map,
		$template = "<a href=\"{url}\">{name}</a>",
		$container = "<div>{links}</div>"
	) {
		$rv = array();

		if (is_string($map)) {
			$map = getMap($map);
		}

		foreach ($map as $k => $v) {
			if (is_string($v)) {
				$l = preg_replace('/\{url\}/', $k, $template);
				$l = preg_replace('/\{name\}/', $v, $l);
				$rv[] = $l;
			} else {
				$rv[] = getLinks($v, $template, $container);
			}
		}
		$rv = join($rv);

		return preg_replace('/\{links\}/', $rv, $container);
	} // getLinks()


	function getPlug() {
		if (!isset($_SESSION['features']) || !is_array($_SESSION['features'])) {
			$_SESSION['features'] = getMap('features');
		}
		$map = $_SESSION['features'];

		if (isset($map[$_SERVER['REQUEST_URI']])) {
			unset($map[$_SERVER['REQUEST_URI']]);
		}

		$rv = array();
		if (sizeof($map) > 0) {
			foreach ($map as $k => $v) {
				$rv[$k] = $v;
				break;
			}
		} else {
			$_SESSION['features'] = getMap('features');
			return getPlug();
		}

		$_SESSION['features'] = $map;

		if (!$rv) {
			return getPlug();
		}


		$intros = array(
			"<b>I agree.</b> <i>Best website ever.</i> See more of it:",
			"Don't act like you're not impressed. See more awesome:",
			"Ohhhhhh myyyyy ...",
			"Pssst! I farted. ... Err ... Here, look at this:",
			"And now for something completely different,", 
			"MMmmeeeeeow.",
			"Run!!! The fartans are coming! <u>Quick!</u> <i>Over here</i> &rarr;",
			"This is not about farts:",
			"This might be about farts:",
			"This one is definitely about farts:",
			"Not what you're looking for? Well, then neither is this:",
			"Seriously. All I can think of right now are fart jokes. Click this:",
			"Seriously guys. An adult person made this:",
			"Not intended for human consumption:",
			"If you like <b>fluffy bunnies</b> &mdash; <i>hooray!</i> Check this out:",
			"Pick a number between 1 and 6. Then click here:",
			"There's more than one way to skin a cat. But, that's gross. Do this instead:"
		);
		$intro = $intros[array_rand($intros)];
		$link = getLinks($rv, "<a href=\"{url}\">{name}</a>", "{links}");
		return "<div class='footer-plug'>{$intro} {$link}</div>\n";

	}

?>
