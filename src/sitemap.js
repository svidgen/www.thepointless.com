const sitemap = {
	'top': {
		'/index': 'Home',
		'/contact': 'Contact Me',
		'/sitemap': 'Site Map',
	},

	'account': {},

	'external': {
		/*
		 * do we even still want these links here???
		 *
				'https://www.facebook.com/thepointless' => '@Facebook',
				'http://www.twitter.com/pointlessdotcom' => '@Twitter',
				'http://cafepress.com/thepointless' => '@Cafepress',
				'http://angrystickman.blogspot.com/' => '@Blogger',
				*/
		'https://www.facebook.com/thepointless': '@Facebook',
		'https://www.angrystickman.net/': '@AngryStickman.net',
	},

	'features': {
		'/apps/shooty-ship-pumpkin-smash': 'Shooty Ship Pumpkin Smash',
		// '/shooty-ship/presidential-edition': 'Shooty Ship Presidential Edition',
		'/w/halloweeny-2015': 'halloweeny (2015)',
		'/falling-candy-corn': 'falling candy corn',
		'/w/big-dinosaur-problem-lately': 'big dinosaur problem lately',
		// '/features/meme?name=cleaning-with-kittens': 'a kitten meme',
		// '/features/meme?name=toilet-paper-not-a-turle': 'a toilet paper meme',
		'/w/dinosaur-people': 'dinosaur people',
		'/apps/shooty-ship/': 'Shooty Ship (Original!)',

		// including the 'id' to satisfy getPlug()
		'/place': 'a place!',

		// '/fart-counter' => 'fart counter',
		// '/awkward-moment': "that awkward moment when ...",
		// '/small-potatoes': 'the book of small potatoes',
		'/ascii-monsters': 'ascii monsters',
		'/preggertest': 'online pregnancy test',
		'/something': 'something',
		'/zebratest': 'zebra awareness test',
		'/clickometer': 'a clickometer',
		'/dots': 'some dots',
	},
};

module.exports = sitemap;
