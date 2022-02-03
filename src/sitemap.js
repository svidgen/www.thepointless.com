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
		'/shooty-ship-pumpkin-smash': 'Shooty Ship Pumpkin Smash',

		// not yet updated for latest president.
		// need to get art for Biden and offer selection screen
		// for which president's face you'd like to shoot:
		// '/shooty-ship/presidential-edition': 'Shooty Ship Presidential Edition',

		'/falling-candy-corn': 'falling candy corn',
		'/w/big-dinosaur-problem-lately': 'big dinosaur problem lately',
		// '/features/meme?name=cleaning-with-kittens': 'a kitten meme',
		// '/features/meme?name=toilet-paper-not-a-turle': 'a toilet paper meme',
		'/w/dinosaur-people': 'dinosaur people',
		'/apps/shooty-ship/': 'Shooty Ship (Original!)',

		// disabled until server-side modeling and whatnot can be re-done
		// on AWS Amplify and/or lambda and/or *
		// '/place': 'a place!',
		// '/awkward-moment': "that awkward moment when ...",
		// '/small-potatoes': 'the book of small potatoes',
		// '/something': 'something',

		// not necessarily dependent on server-side stuff, but might not be
		// worth the effort to migrate right now ... 
		// '/ascii-monsters': 'ascii monsters',
		
		'/preggertest': 'online pregnancy test',
		'/zebra-awareness': 'zebra awareness',
		'/clickometer': 'a clickometer',
		'/dots': 'some dots',
	},
};

module.exports = sitemap;
