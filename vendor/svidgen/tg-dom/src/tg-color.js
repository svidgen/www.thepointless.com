TG.Color = function Color(r, g, b) {
	this.loadHex = function(c) {
		// strip off hash symbol, if present
		var c = c.replace("#", "");

		// pull out individual rgb hex values
		var r = parseInt(c.substr(0, 2), 16);
		var g = parseInt(c.substr(2, 2), 16);
		var b = parseInt(c.substr(4, 2), 16);

		// assign rgb values to 'this'
		this.loadRGB(r, g, b);
	}; // loadHex()


	this.loadRGB = function(r, g, b) {
		// set lower limit of 0
		r = r > 0 ? r : 0;
		g = g > 0 ? g : 0;
		b = b > 0 ? b : 0;
		
		// set upper limit of 255
		r = r < 255 ? r : 255;
		g = g < 255 ? g : 255;
		b = b < 255 ? b : 255;

		// round and assign
		this.r = Math.round(r);
		this.g = Math.round(g);
		this.b = Math.round(b);
	}; // loadRGB()


	this.loadHSL = function (h, s, l) {
		// cap S and L and turn them into floats
		s = Math.min(Math.max(s, 0), 100) / 100;
		l = Math.min(Math.max(l, 0), 100) / 100;

		// chroma is the "colorfulness" of the final color.
		// basically, it's saturation reduced by the effect
		// of lightness.
		var chroma = (1 - Math.abs(2*l - 1)) * s;

		// lightness component to be added to final vectors
		var lc = l - (chroma/2);
	
		// color vector focal points: the points at which
		// each color is pure and solitary.
		var rf = 0;
		var gf = 120;
		var bf = 240;

		// color vectors
		var r = chroma * this.colorVector(rf, h) + lc;
		var g = chroma * this.colorVector(gf, h) + lc;
		var b = chroma * this.colorVector(bf, h) + lc;

		this.r = Math.round(r * 255);
		this.g = Math.round(g * 255);
		this.b = Math.round(b * 255);
		
	}; // loadHSL()


	this.loadRGBString = function(c) {
		this.loadCSS(c);
	}; // loadRGBString()


	this.loadHSLString = function(c) {
		this.loadCSS(c);
	}; // loadHSLString()


	this.loadCSS = function(c) {
		var m;
		if (m = c.match(/rgb\(([0-9]+), ?([0-9]+), ?([0-9]+)/i)) {
			this.loadRGB(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
		} else if (m = c.match(/hsl\(([0-9]+), ?([0-9]+)%, ?([0-9]+)%/i)) {
			this.loadHSL(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]));
		} else if (m = c.match(/#/)) {
			this.loadHex(c);
		}
	}; // loadCSS()


	this.toHex = function() {
		// convert rgb values to hex
		var ca = [
			Number(this.r).toString(16),
			Number(this.g).toString(16),
			Number(this.b).toString(16)
		];

		// 0-pad rgb strings
		for (var i in ca) {
			if (ca[i].length == 0) {
				ca[i] = '00';
			} else if (ca[i].length == 1) {
				ca[i] = '0' + ca[i];
			}
		}

		return '#' + ca.join('');

	}; // toHex()


	this.toRGBString = function() {
		return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
	}; // toRGBString()


	this.toHSLString = function() {
		var r = this.r / 255;
		var g = this.g / 255;
		var b = this.b / 255;

		var maxc = Math.max(r, g, b);
		var minc = Math.min(r, g, b);

		var chroma = maxc - minc;
		var l = (maxc + minc)/2;

		var d = (1 - Math.abs(2*l - 1));
		var s = d > 0 ? chroma / d : 1;

		var h = 0;
		if (chroma > 0) {
			if (maxc == r) {
				h = ((g-b)/chroma) % 6;
			} else if (maxc == g) {
				h = (b-r)/chroma + 2
			} else if (maxc == b) {
				h = (r-g)/chroma + 4;
			}
		}
		h = Math.round(h * 60);

		s = Math.round(s * 100);
		l = Math.round(l * 100);
		return "hsl(" + h + "," + s + "%," + l + "%)";
	}; // toHSLString()


	this.toString = function() {
		return this.toHex();
	}; // toString()


	this.angleBetween = function(a, b) {
		var rv = Math.abs(a-b);
		if (rv > 180) {
			rv = 360 - rv;
		}
		return rv;
	}; // angleBetween()


	this.colorVector = function(focus, angle) {
		var rv = this.angleBetween(focus, angle);
		if (rv > 120) {
			return 0;
		} else {
			return 1 - (Math.max(0, rv - 60) / 60);
		}
	}; // colorVector()


	this.distanceTo = function(c) {
		// 3d pythagorean theorem.
		var rd = Math.pow(c.r - this.r, 2);
		var gd = Math.pow(c.g - this.g, 2);
		var bd = Math.pow(c.b - this.b, 2);
		return Math.sqrt(rd + gd + bd);
	}; // distanceTo()

	var limitPercentage = function(p) {
		var rv = p === undefined ? 0.5 : p;
		rv = rv > 0 ? rv : 0;
		rv = rv < 1 ? rv : 1;
		return rv;
	};


	var blend = function(a, b, p) {
		var rv = {};
		var p = limitPercentage(p);
		var tp = 1 - p;
		for (var i in a) {
			rv[i] = tp * a[i] + p * b[i];
		}
		return rv;
	}; // blend();


	this.getBlendedColor = function(color, percent) {
		var c = blend(this, color, percent);
		return new Color(c.r, c.g, c.b);
	}; // getBlendedColor ()


	//
	// EXPERIMENTAL

	this.getPaintMixedColor = function(color, percent) {
		// var a = RGBtoCMY(this);
		// var b = RGBtoCMY(color);

		var a = crayola(this);
		var b = crayola(color);

		var c = blend(a, b, percent);

		// var c = CMYtoRGB(c);

		return new Color(c.r, c.g, c.b);
	}; // getBlendedColorRYB


	var crayola = function(c) {
		return {
			r: 210 * c.r/255 + 35 * c.g/255,
			g: 210 * c.g/255 + 35 * c.b/255,
			b: 210 * c.b/255 + 35 * c.r/255
		};
	}; // crayola()


	var RGBtoCMY = function(c) {
		return {
			c: 255 - c.r,
			m: 255 - c.g,
			y: 255 - c.b 
		};
	}; // getCMY()


	var CMYtoRGB = function(c) {
		return {
			r: 255 - c.c,
			g: 255 - c.m,
			b: 255 - c.y
		};
	}; // RGBfromCMY()

	// EXPERIMENTAL
	//


	this.r = 0;
	this.g = 0;
	this.b = 0;


	if (Color.arguments.length == 3) {
		this.loadRGB(r, g, b);
	} else {
		if (r instanceof Color) {
			this.loadRGB(r.r, r.g, r.b);
		} else {
			this.loadCSS(r);
		}
	}

}; // Color

module.exports = TG.Color;
