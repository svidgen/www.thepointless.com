const { DomClass } = require('wirejs-dom');
require('./share.css');

/**
 * Returns the style for a node.
 *
 * @param n The node to check.
 * @param p The property to retrieve (usually 'display').
 * @link http://www.quirksmode.org/dom/getstyles.html
 */
function getStyle(n, p) {
	return n.currentStyle ?
		n.currentStyle[p] :
		document.defaultView.getComputedStyle(n, null).getPropertyValue(p);
}

/**
 * Converts HTML to text, preserving semantic newlines for block-level
 * elements.
 *
 * @param node - The HTML node to perform text extraction.
 */
function toText(node) {
	var result = '';

	if (node.nodeType == document.TEXT_NODE) {
		// Replace repeated spaces, newlines, and tabs with a single space.
		result = node.nodeValue.replace(/\s+/g, ' ');
	}
	else {
		for (var i = 0, j = node.childNodes.length; i < j; i++) {
			result += toText(node.childNodes[i]);
		}

		var d = getStyle(node, 'display');

		if (d.match(/^block/) || d.match(/list/) || d.match(/row/) ||
			node.tagName == 'BR' || node.tagName == 'HR') {
			result += '\n';
		}
	}

	return result;
}

const template = `<tpdc:share>
	<div class='header' data-id='header'>Make it happen, Cap'n.</div>
	<a data-id='fb_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='twitter_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='email_link' class='social-link'><img class='social-icon' /></a>
	<a data-id='copy_link' class='social-link'>📋</a>
	<a data-id='native_link' class='social-link'><img class='social-icon' /></a>
</tpdc:share>`;

module.exports = DomClass(template, function Share() {
	var _t = this;

	const NL = encodeURIComponent('\n');

	this.getData = function () {
		return {
			title: this.title || document.title,
			text: this.text || (() => {
				var meta = document.querySelector("meta[name=\'description\']");
				if (meta) {
					return meta.getAttribute("content");
				}
			})(),
			url: this.url
		};
	};

	this.getObject = function () {
		const data = this.getData();

		if (!data.url) {
			data.url = document.location.href;
		}

		data.url = data.url.innerText ? toText(data.url) : data.url;
		if (!data.url.startsWith('http')) {
			data.url = [
				document.location.origin,
				'/',
				data.url.replaceAll('//', '/').replace(/^\//, '')
			].join('');
		}

		return {
			title: (data.title && data.title.innerText) ? toText(data.title) : data.title || '',
			text: (data.text && data.text.innerText) ? toText(data.text) : data.text || '',
			url: data.url
		};
	};

	this.getEncodedObject = function() {
		const o = this.getObject();
		return {
			title: encodeURIComponent(o.title),
			text: encodeURIComponent(o.text),
			url: encodeURIComponent(o.url)
		};
	}

	this.track = function (channel) {
		var o = _t.getObject();
		gtag('event', 'share', {
			'event_category': 'page'
		});
	};

	this.fb_link.onclick = function () {
		_t.track('facebook');
		const { text, url } = _t.getEncodedObject();
		window.open(
			`https://www.facebook.com/sharer.php?u=${url}&quote=${text}`,
			'facebook_share'
		);
		return false;
	};

	this.twitter_link.onclick = function () {
		_t.track('twitter');
		const { url, text } = _t.getEncodedObject();
		window.open(
			`https://twitter.com/share?url=${url}&text=${text}${NL}${NL}`,
			'twitter_share'
		);
		return false;
	};

	this.email_link.onclick = function () {
		_t.track('email');
		const { title, text, url } = _t.getEncodedObject();
		window.open(
			`mailto:?to=&subject=${title}&body=${text}${NL}${NL}${url}`,
			'email_share'
		);
		return false;
	};

	
	this.copy_link.onclick = function () {
		_t.track('copy');
		const { title, text, url } = _t.getObject();
		navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
			_t.copy_link = '✔️';
			setTimeout(() => _t.copy_link = '📋', 1000);
		});
	};

	this.native_link.onclick = function () {
		_t.track('native');
		navigator.share(_t.getObject()).then(
			() => console.log('shared')
		).catch(
			() => console.log('not shared')
		);
	};

	if (!navigator.share) {
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
