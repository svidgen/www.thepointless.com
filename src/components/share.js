const { DomClass } = require('wirejs-dom');
require('./share.css');

const template = `<tpdc:share>
	<div class='header' data-id='text'>Make it happen, Cap'n.</div>
	<a data-id='fb_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='twitter_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='email_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='native_link' class='social-link'><img class='social-icon' /></a>
</tpdc:share>`;

module.exports = DomClass(template, function Share() {
	var _t = this;

	var inner_object;

	this.getObject = function() {
		// hack to prevent re-processing and url-breaking.
		var rv = {};

		if (_t.object) {
			rv = _t.object;
		} else {
			rv = _t;
		}

		if (inner_object) {
			rv.url = inner_object.url;
		} else if (!rv.url) {	
			rv.url = document.location;
		} else {
			rv.url = document.origin + rv.url;
		}

		if (!rv.category) {
			rv.category = 'page';
		}

		if (!rv.title) {
			rv.title = document.title;
		}

		if (!rv.text) {
			var meta = document.querySelector("meta[name=\'description\']");
			if (meta) {
				rv.text = meta.getAttribute("content");
			}
		}

		if (!rv.image) {
			rv.image = document.origin + "/images/big_giant.jpg";
		}

		if (typeof(rv.proxy) == 'undefined') {
			rv.proxy = true;
		}

		inner_object = rv;

		return rv;
	};

	this.track = function(channel) {
		var o = _t.getObject();
		gtag('event', 'share', {
			'event_category': o.category
		});
	};

	this.fb_link.onclick = function() {
		_t.track('facebook');
		var o = _t.getObject();

		var url = "https://www.facebook.com/sharer.php?u=";

		if (o.proxy) {
			url = url + "http://" + (location.host || location.hostname) + "/share-data?"
				+ encodeURIComponent(
					"t=" + encodeURIComponent(o['title'] || '')
					+ "&b=" + encodeURIComponent(o['text'] || '')
					+ "&i=" + encodeURIComponent(o['image'] || '')
					+ "&u=" + encodeURIComponent(o['url'] || '')
				)
			;
		} else {
			url = url + o['url'];
		}

		window.open(url, 'facebook_share');
		return false;
	};

	this.twitter_link.onclick = function() {
		_t.track('twitter');
		var o = _t.getObject();
		var title = "#" + (o['title'] || 'thepointlessdotcom')
			.toLowerCase()
			.replace(/thepointless\.com/, '')
			.replace(/[^a-z0-9]/g, '')
		;
		var	url = "https://twitter.com/share?"
			+ "u=" + encodeURIComponent(o['url'])
			+ "&text=" + encodeURIComponent(
				(o['text'] || '') + ' ' + title
			)
		;
		window.open(url, 'twitter_share');
		return false;
	};

	this.email_link.onclick = function() {
		_t.track('email');
		var o = _t.getObject();
		var url = "mailto:?to=&"
			+ "subject=" + encodeURIComponent(o['title'] || 'thepointless.com')
			+ "&body=" + encodeURIComponent(o['text'] || '')
			 	+ encodeURIComponent("\n\n")
				+ encodeURIComponent(o['url'] || document.location)
		;
		window.open(url, 'email_share');
		return false;
	};

	this.native_link.onclick = function() {
		_t.track('native');
		var o = _t.getObject();
		navigator.share({
			title: o.title,
			text: o.text,
			url: o.url,
		}).then(
			() => console.log('shared')
		).catch(
			() => console.log('not shared')
		);
	};

	if (navigator.share) {
		this.fb_link.style.display = 'none';
		this.twitter_link.style.display = 'none';
		this.email_link.style.display = 'none';
	} else {
		this.native_link.style.display = 'none';
	}

	// hmm ... i don't like this.
	// but, it let's us share the share code between the main site
	// and our individual PWA's.
	const imagePath = this.imagePath || '/images';
	this.fb_link.firstChild.src = `${imagePath}/fb_icon_22px.png`;
	this.twitter_link.firstChild.src = `${imagePath}/twitter_logo_22px.png`;
	this.email_link.firstChild.src = `${imagePath}/email_logo_22px_h.png`;
	this.native_link.firstChild.src = `${imagePath}/native-share.svg`;

});
