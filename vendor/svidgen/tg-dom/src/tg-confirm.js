require('tg-namespace.js');

TG.confirm = function(s) {
	var _s = ["ARDVARK","BABOON","CATERPILLAR","DONKEY","ELEPHANT","FISHY","GODZILLA","HIPPO","IGUANA","JAGUAR","KANGAROO","LIZARD","MONKEY","NEWT","OSTERICH","PENGUIN","QUACK","RHINO","SNAKE","TURTLE","UMBRELLA","VIPER","WOMBAT","XYLOPHONE","ZEBRA"];
	var s = s || _s[Math.floor(Math.random() * _s.length)];
	var c = prompt("Type " + s + " to confirm.");

	if (c == null || c == '') {
		return false;
	}

	if (c.replace(/^\s+/, '').replace(/\s+$/, '').toUpperCase() == s) {
		return true;
	} else {
		alert({message: "No match!"});
		return false;
	}
} // TG.confirm()


