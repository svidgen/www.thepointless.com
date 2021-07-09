const { DomClass } = require('wirejs-dom');
require('./share.css');

const template = `<tpdc:share>
		<div class='header'>Make it happen, Cap'n.</div>
		<a data-id='fb_link' class='social-link'><img
			class='social-icon'
			src='/images/fb_icon_22px.png'
		/></a>
		<a data-id='twitter_link' class='social-link'><img
			class='social-icon'
			src='/images/twitter_logo_22px.png'
		/></a>
		<a data-id='email_link' class='social-link'><img
			class='social-icon'
			src='/images/email_logo_22px_h.png'
		/></a>
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
	}; // getObject()

	this.track = function(channel) {
		var o = _t.getObject();
		window._gaq = window._gaq || [];
		_gaq.push(['_trackEvent', 'Share', channel, o['url'], null])
	}; // track()

	this.fb_link.onclick = function() {
		_t.track('Facebook');
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
	}; // fb_link.onclick()

	this.twitter_link.onclick = function() {
		_t.track('Twitter');
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
	}; // twitter_link.onclick()

	this.email_link.onclick = function() {
		_t.track('Email');
		var o = _t.getObject();
		var url = "mailto:?to=&"
			+ "subject=" + encodeURIComponent(o['title'] || 'thepointless.com')
			+ "&body=" + encodeURIComponent(o['text'] || '')
			 	+ encodeURIComponent("\n\n")
				+ encodeURIComponent(o['url'] || document.location)
		;
		window.open(url, 'email_share');
		return false;
	}; // email_link.onclick()

});
