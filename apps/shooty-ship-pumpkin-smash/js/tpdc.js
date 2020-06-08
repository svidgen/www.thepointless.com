//
// Copyright (c) 2012 http://www.thepointless.com/
//
// Provided as is, without warranty of any kind. This IS
// a work in progress. So, it's probaby buggy.
//
// Use it and abuse it however you like. But, if you'd be
// so kind, leave this notice in tact and don't hotlink!
//
// Jon Wire
// http://www.linkedin.com/in/jonwire
//

//
// TPDC namespace
//

TPDC = this.TPDC || {};

TPDC.addSlashes = function(s) {
	s = String(s);
	s = s.replace(/\\/g, "\\\\");
	s = s.replace(/\"/g, "\\\"");
	s = s.replace(/\'/g, "\\\'");
	return s;
} // TPDC.addSlashes()


TPDC.jsonEscape = function(s) {
	s = String(s);
	s = s.replace(/\\/g, "\\\\");
	s = s.replace(/\"/g, "\\\"");
	s = s.replace(/\//g, "\\/");
	s = s.replace(/[\b]/g, "\\b");
	s = s.replace(/\f/g, "\\f");
	s = s.replace(/\n/g, "\\n");
	s = s.replace(/\r/g, "\\r");
	s = s.replace(/\t/g, "\\t");
	s = s.replace(/[^\u0020-\u007d]/g, function(s) {
			return '\\u' + ('0000' + s.charCodeAt(0).toString(16)).slice(-4);
		}
	);
	return s;
} // TPDC.jsonEscape()


TPDC.jsonAddSlashes = function(s) {
	return TPDC.jsonEscape(s);
} // TPDC.jsonAddSlashes()



	var n = document.createElement('div');
	n.innerHTML = " <span>a</span>";
	n.style.display = 'none';
	document.body.appendChild(n);
	TPDC.__Node = {};
	for (var i in n) {
		TPDC.__Node[i] = 1;
	}
	document.body.removeChild(n);


TPDC.stringify = function (o, depth) {
	var d = depth || 32;
	if (d < 1) {
		return "null";
	}

	var ommissions = {};
	if (o instanceof Node || o instanceof Element) {
		ommissions = TPDC.__Node;
	}

	if (typeof (o) == 'object') {
		var rv = [];
		for (var i in o) {
			if (ommissions[i] == null) {
				var v = TPDC.stringify(o[i], d - 1);
				var k = TPDC.stringify(i);
				if (v) {
					rv.push(k + ':' + v);
				}
			}
		}
		return '{' + rv.join(',') + '}';
	} else if (typeof (o) == 'function') {
		return false;
	} else {
		return '"' + TPDC.jsonEscape(o) + '"';
	}

} // TPDC.stringify()


TPDC.jsonp = function(action, o, cb) {
	// prepare callback function
	if (cb) {
		var d = (new Date()).getTime();
		var r = Math.round(Math.random() * 10000);
		var cb_key = action + "." + d + "." + r;
		var t = setTimeout(function() { delete TPDC.callbacks[cb_key]; }, 1000 * 60 * 5);
		TPDC.callbacks[cb_key] = function() { 
			cb.apply(window, arguments);
			delete TPDC.callbacks[cb_key];
			clearTimeout(t);
		}
	}

	// prepare request parameters
	var json = encodeURIComponent(TPDC.stringify(o));

	var root = '/ajax/';
	if (action.match(/^\//)) {
		root = '';
	}

	// send request
	TPDC.jsonpRaw(root + action + ".jsonp?cb=TPDC.callbacks['" + cb_key + "']&o=" + json);
	
} // TPDC.jsonp()
TPDC.callbacks = {};


TPDC.jsonpRaw = function(url) {
	var request = document.createElement('script');
	request.type = 'text/javascript';
	request.src = url;
	document.body.appendChild(request);
	setTimeout(function() { document.body.removeChild(request); }, 90000);
} // TPDC.jsonpRaw()


TPDC.FacebookPublish = function(o) {
	var o = o || {};

	var fbo = {
		method: 'feed',
		name: o['name'] || document.title,
		link: o['link'] || document.location.href,
		source: o['image'] || o['source'] || document.location.protocol + "//" + document.location.host + "/images/big_giant.png",
		description: o['description'] || document.title,
		properties: o['properties'] || {},
		actions: o['actions'] || [{
			name: o['name'] || document.title,
			link: o['link'] || document.location.href
		}]
	};

	// console.log(fbo);

	FB.ui(fbo, function(rv) {
		if (rv && rv.post_id) {
			TPDC.award(1, "Social Butterfly");
		}
	});
} // FBPublish()


var Game = Game || function(override_c) {
	// default configuration
} // TPDC.FacebookPublish()


TPDC.voterCB = function(new_token, id, vote, newcount) {
	api_token = new_token;
	var voters = getNodes(document, 'tpdc:voter');
	for (var i = 0; i < voters.length; i++) {
		var n = voters[i];
		if (n.record_id == id) {
			n.updateCount(newcount);
			n.vote = vote;
			n.toggleContents();
		}
	}
} // voterCB()


TPDC.MainLoop = function() {
	// for computing "utilization"
	var _S = new Date();
	var _o = TPDC.MainLoop.objects;
	var f = TPDC.MainLoop.functions;


	// remove "dead" objects
	var o = [];
	for (var i = 0; i < _o.length; i++) {
		if (!_o[i].dead) {
			o.push(_o[i]);
		}
	}
	TPDC.MainLoop.objects = o;

	// step loop
	for (var i = 0; i < o.length; i++) {
		o[i].step();
	}
	
	// draw loop
	for (var i = 0; i < o.length; i++) {
		o[i].draw();
	}

	
	// run plugins
	for (var i = 0; i < f.length; i++) {
		if (typeof(f[i]) == 'function') {
			f[i]();
		}
	}


	//
	// benchmarking / utilization guesstimating.
	// this is highly inaccurate at the moment. may have to introduce
	// a multiplier to estimate CPU time used outside MainLoop ... or
	// just find a way to track CPU time outside MainLoop.
	//

	var stats = document.getElementById('__stats');
	if (stats) {
		var ml = TPDC.MainLoop;
		var _E1 = ml.__endLastRun;
		var _E1_t = _E1.getTime();
		var _E2 = new Date();
		var _E2_t = _E2.getTime();

		var _period = ml.__period + _E2_t - _E1_t;
		if (_S.getTime() - ml.__startLastRun.getTime() > 1000 / ml.__fps) {
			var _runtime = ml.__runtime + (_E2_t - _E1_t)/2;
		} else {
			var _runtime = ml.__runtime + (_E2_t - _S.getTime());
		}

		if (_period >= 1000) {
			var _util = _runtime / Math.max(1, _period);
			stats.innerHTML = _runtime + "/" + _period + " = " + String(Math.round(_util * 100)) + "%";
			_runtime = 0;
			_period = 0;
		}

		ml.__period = _period;
		ml.__runtime = _runtime;
		ml.__endLastRun = _E2;
		ml.__startLastRun = _S;
	}
} // TPDC.MainLoop()
TPDC.MainLoop.__fps = 30;
TPDC.MainLoop.__interval = null;
TPDC.MainLoop.__startLastRun = new Date();
TPDC.MainLoop.__endLastRun = new Date();
TPDC.MainLoop.__period = 0;
TPDC.MainLoop.__runtime = 0;
TPDC.MainLoop.objects = [];
TPDC.MainLoop.functions = [];

TPDC.MainLoop.running = function() {
	return TPDC.MainLoop.__interval;
} // TPDC.MainLoop.running()

TPDC.MainLoop.addFunction = function(f) {
	if (typeof(f) == 'function') {
		var m = TPDC.MainLoop;
		var mf = m.functions;
		for (var i = 0; i < mf.length; i++) {
			if (f == mf[i]) {
				return true;
			}
		}
		mf.push(f);
		m.start();
		return true;
	} else {
		return false;
	}
} // TPDC.MainLoop.addFunction()

TPDC.MainLoop.addObject = function(o) {
	if (typeof(o) == 'object'
		&& o.step && typeof(o.step) == 'function'
		&& o.draw && typeof(o.draw) == 'function'
	) {
		var m = TPDC.MainLoop;
		var mo = m.objects;
		for (var i = 0; i < mo.length; i++) {
			if (o === mo[i]) {
				return true;
			}
		}
		mo.push(o);
		m.start();
		return true;
	} else {
		return false;
	}
} // TPDC.MainLoop.addObject()

TPDC.MainLoop.removeFunction = function(f) {
	var mf = TPDC.MainLoop.functions;
	for (var i = 0; i < mf.length; i++) {
		if (mf[i] === f) {
			mf.splice(i, 1);
			return;
		}
	}
} // TPDC.MainLoop.removeFunction()

TPDC.MainLoop.removeObject = function(o) {
	var mo = TPDC.MainLoop.objects;
	for (var i = 0; i < mo.length; i++) {
		if (mo[i] === o) {
			mo.splice(i, 1);
			return;
		}
	}
} // TPDC.MainLoop.removeObject()

TPDC.MainLoop.start = function(fps) {
	if (!TPDC.MainLoop.__interval) {
		TPDC.MainLoop.__fps = fps || TPDC.MainLoop.__fps;
		TPDC.MainLoop.__interval = setInterval(function() { TPDC.MainLoop(); }, 1000 / TPDC.MainLoop.__fps);
	}
} // TPDC.MainLoop.start()

TPDC.MainLoop.stop = function() {
	TPDC.MainLoop.__interval = clearInterval(TPDC.MainLoop.__interval);
} // TPDC.MainLoop.stop()

TPDC.MainLoop.pause = function() {
	return TPDC.MainLoop.stop();
} // TPDC.MainLoop.pause()


TPDC.Notification = function(title, description, container) {
	var _t = this;
	var _container = container || document.getElementById('notifications');

	this.step = function() {
		var now = new Date();
		var age = now.getTime() - this.start_time.getTime();
		this.life = 1 - (age / this.max_age);
		if (this.life < 0.01) {
			this.destroy();
		}
	}; // step

	this.draw = function() {
		var opacity = Math.min(this.life * 3, .9);
		this.style.opacity = opacity;
		this.style.filter = 'alpha(opacity=' + opacity * 100 + ')';
	}; // draw()

	this.destroy = function() {
		this.dead = true;
		this.life = 0.00;
		_container.removeChild(this);
	}; // destroy()

	this.closeButton.onclick = function() {
		_t.destroy();
	}; // closeButton.onclick()

	this.start_time = new Date();
	this.dead = false;
	this.max_age = 15000;
	this.life = 1.00;

	this.style.top = '15px';
	this.style.left = '15px';
	this.className = 'notification achievement';

	_container.appendChild(this);

	TPDC.MainLoop.addObject(this);

} // TPDC.Notification()
TPDC.Notification.templateMarkup = 
	"<span data-id='closeButton' style='float: right; cursor: pointer;'>X</span>" +
	"<b><u><span data-id='title'></span></u></b>" +
	"<div data-id='description'></div>"
;
Bind(TPDC.Notification, 'tpdc-notification');


TPDC.Notify = function(title, description) {
	New(TPDC.Notification, {title: title, description: description});
} // TPDC.Notify()


TPDC.confirm = function(s) {
	var _s = ["ARDVARK","BABOON","CREEPTASTIC","DONKEY","ELEPHANT","FISHY","GODZILLA","HIPPO","IGUANA","JAGUAR","KANGAROO","LIZARD","MONKEY","NEWT","OSTERICH","PENGUIN","QUACK","RHINO","SNAKE","TURTLE","UMBRELLA","VIPER","WALDO","XYLOPHONE","YUMMY","ZEBRA"];
	var s = s || _s[Math.floor(Math.random() * _s.length)];
	var c = prompt("Type " + s + " to confirm.");

	if (c == null || c == '') {
		return false;
	}

	if (c.replace(/^\s+/, '').replace(/\s+$/, '').toUpperCase() == s) {
		return true;
	} else {
		alert("Invalid entry.");
		return false;
	}
} // TPDC.verifyDelete()


var insertAfter = function(new_node, existing_node) {
	if (existing_node.nextSibling) {
		existing_node.parentNode.insertBefore(new_node, existing_node.nextSibling);
	} else {
		existing_node.parentNode.appendChild(new_node);
	}
} // insertAfter()


//
// <tpdc:voter record_id='{ID}' vote='1'>
//  <tpdc:count></tpdc:count>
//  <tpdc:vote><b>Vote!</b></tpdc:vote>
//  <tpdc:unvote><i>Unvote.</i></tpdc:unvote>
// </tpdc:voter>
//
TPDC.Voter = function() {

	if (!(this instanceof Node)) {
		return New(TPDC.Voter);
	}

	this.toggleContents = function() {
		var vote_nodes = getNodes(this, 'tpdc:vote');
		for (var v = 0; v < vote_nodes.length; v++) {
			if (this.vote == 1) {
				vote_nodes[v].style.display = 'none';
			} else {
				vote_nodes[v].style.display = 'inline';
			}
		}	

		var unvote_nodes = getNodes(this, 'tpdc:unvote');
		for (var v = 0; v < unvote_nodes.length; v++) {
			if (this.vote == 1) {
				unvote_nodes[v].style.display = 'inline';
			} else {
				unvote_nodes[v].style.display = 'none';
			}
		}
	} // toggleContents()


	this.updateCount = function(vote) {
		var counts = getNodes(this, 'tpdc:count');
		for (var i = 0; i < counts.length; i++) {
			counts[i].innerHTML = vote;
		}
	} // updateCount()


	this.onclick = function() {
		var vote = this.vote == 0 ? 1 : 0;
		var s = document.createElement('script');
		s.type = 'text/javascript';
		s.src = this.method + '?id=' + this.record_id + '&vote=' + vote + '&cb=TPDC.voterCB&token=' + window.api_token;
		document.body.appendChild(s);
	} // onclick()

	this.toggleContents();
	this.style.cursor = 'pointer';

	// create a LIKE subscription
	if (this.fb_like_url) {
		TPDC.FacebookCallbacks = TPDC.FacebookCallbacks || {};

		var that = this;
		TPDC.FacebookCallbacks['like.' + this.fb_like_url] = function() {
			// only simulate the click if vote == false
			if (that.vote == 0) {
				that.onclick();
			}
		}

		TPDC.FacebookCallbacks['unlike.' + this.fb_like_url] = function() {
			// only simulate the click if vote == false
			if (that.vote == 1) {
				that.onclick();
			}
		}

	}

} // voter()
Bind(TPDC.Voter, 'tpdc:voter');


TPDC.StalkLink = function() {

	this.setText = function() {
		if (this.stalking) {
			this.verb.innerHTML = 'Un-Stalk';
			this.roughedge.setHoverColor('red');
		} else {
			this.verb.innerHTML = 'Stalk';
			this.roughedge.setHoverColor('green');
		}
	}; // setText()

	this.toggle = function() {
		var _t = this;
		var setTo = null;
		if (typeof(this.stalking) !== 'undefined') {
			setTo = !this.stalking;
		}
		TPDC.API.setStalking(this.victim, setTo).returnTo(
			function(rv) {
				if (rv.error) {
					console.log(rv);
				} else {
					if (rv.rv !== undefined) {
						_t.stalking = rv.rv;
						_t.setText();
					}
				}
			}
		);
	}; // toggle()

	this.onclick = this.toggle;

	if (typeof(this.stalking) === 'undefined') {
		this.toggle();
	} else {
		this.setText();
	}
	
}; // TPDC.StalkLink
TPDC.StalkLink.templateMarkup = 
	"<tpdc:roughedge data-id='roughedge' style='cursor: pointer;'>"
	+ "<span class='block-link' data-id='verb'></span>"
	+ "</tpdc:roughedge>"
;
Bind(TPDC.StalkLink, 'tpdc:stalklink');


TPDC.ConversationHeader = function() {
	this.conversationLink.href = '/conversation?with=' + this['user-id'];

	this.unreadCountSpan.innerHTML = this.unread + " unread";
	if (this.unread > 0) {
		this.unreadCountSpan.style.fontWeight = 'bold';
	}

	// this.userLink.href = '/profile?id=' + this['user-id'];
	this.userNameSpan.innerHTML = this.username;

	this['last-update'] = new Date(this['last-update'].replace(' ','T'));
	this.lastUpdateContainer.innerHTML = 
		// this['last-update'].toLocaleTimeString()
		// +
		this['last-update'].toLocaleDateString();

	this.leftSide.innerHTML = this.image || '';

}; // TPDC.ConversationHeader
TPDC.ConversationHeader.templateMarkup = 
	"<a data-id='conversationLink'>" +
	"<table style='width: 100%;'><tr>" +
	"<td data-id='leftSide' style='width: 60px;'></td>" +
	"<td data-id='rightSide'>" +
	"<span data-id='userNameSpan'></span> <br />" +
	"<span data-id='unreadCountSpan'></span> " +
	" as of <span data-id='lastUpdateContainer'></span> " +
	"</td>" +
	"</tr></table>" +
	"</a>"
;
Bind(TPDC.ConversationHeader, 'tpdc:conversationheader');


TPDC.Conversation = function() {

	this.minId = Math.pow(2,512);
	this.maxId = 0;
	this.maxReadId = 0;
	this.loaded = false;
	var _t = this;

	this.add = function(m) {
		if (isa(m, 'TPDC.Message')) {
			var mc = this.messagesContainer;
			this.maxId = Math.max(this.maxId, m['message-id']);
			this.minId = Math.min(this.minId, m['message-id']);
			if (m['message-id'] == this.maxId) {
				var s = mc.scrollTop + mc.offsetHeight >= mc.scrollHeight - 10;
				mc.appendChild(m);
				if (this.loaded && s) {
					setTimeout(function() {
						mc.scrollTop = mc.scrollHeight;
					}, 100);
				}
			} else {
				var n = mc.firstChild;
				while (n['message-id'] < m['message-id']) {
					var n = mc.firstChild;
				}
				mc.insertBefore(m,n);
				mc.scrollTop = 0;
			}
		} else {
			this.add(New(TPDC.Message, m));
		}
	}; // this.addMessage()

	this.sendButton.onclick = function() {
		TPDC.API.sendMessage(_t['with'], _t.messageBox.getValue()).returnTo(
			function(rv) {
				if (rv.error) {
					console.log(rv);
				} else {
					_t.messageBox.clear();

					// sent message will be received via receiveNew()
					// _t.add(rv);
				}
			}
		);
	}; // sendButton.onclick()

	this.startReceiving = function() {
		TPDC.API.receiveNewMessages_start(_t['with'], _t.maxId).returnTo(
			function(rv) {
				if (rv.error || !isa(rv, Array)) {
					console.log(rv);
				} else {
					for (var i = 0; i < rv.length; i++) {
						_t.add(rv[i]);
					}
				}
			}
		);
	}; // this.startReceiving()

	this.messagesContainer.onscroll = function() {
		if (this.scrollTop + this.offsetHeight >= this.scrollHeight - 10) {
			if (_t.maxId > _t.maxReadId && !_t.pendingMarkRead) {
				var updateTo = _t.maxId;
				_t.pendingMarkRead = true;
				TPDC.API.markConversationRead(_t['with'], _t.maxId).returnTo(
					function(rv) {
						_t.pendingMarkRead = false;
						if (rv.error) {
							console.log(rv);
						} else {
							_t.maxReadId = updateTo;
						}
					}
				);
			}
		}
	}; // messagesContainer.onscroll()

	upon(function() { return TPDC.Message; }, function() {
		for (var i = 0; i < _t.parameters.length; i++) {
			var p = _t.parameters[i];
			if (isa(p, 'TPDC.Message')) {
				_t.add(p);
			}
		}
		setTimeout(function() {
			_t.messagesContainer.scrollTop = _t.messagesContainer.scrollHeight;
		}, 350);
		_t.loaded = true;
		_t.startReceiving();

	});

	this.newMessage.name = this.user;
	this.newMessage.image = this['user-image'];

	if (this['with'] == 0) {
		this.newMessage.style.display = 'none';
	}

	var s = document.createElement('script');
	s.src = '//google-code-prettify.googlecode.com/svn/branches/release-1-Jun-2011/src/prettify.js';
	s.type = 'text/javascript';
	document.body.appendChild(s);

}; // TPDC.Conversation
TPDC.Conversation.templateMarkup =
	"<div data-id='messagesContainer' style='max-height: 400px; overflow-y: scroll;'></div>" +
	"<tpdc:message data-id='newMessage'><div data-id='messageNode'>" +
	"<tpdc:growingtextarea data-id='messageBox'></tpdc:growingtextarea>" +
	"<br /><input type='button' data-id='sendButton' value='send' /></div>" +
	"</tpdc:message>" +
	"<link href='//google-code-prettify.googlecode.com/svn/branches/release-1-Jun-2011/src/prettify.css' rel='stylesheet' type='text/css'/>"
;
Bind(TPDC.Conversation, 'tpdc:conversation');


TPDC.Message = function() {
	var _t = this;

	this['message-id'] = Number(this['message-id']) || 0;

	if (this.messageNode.innerHTML == '') {
		upon(function() { return typeof(prettyPrintOne) == 'function'; }, function() {

			// TODO: make better!

			var cache = {};
			var k = Math.round(Math.random() * 1000000);
			var m = _t.message
			.replace(/\n/g, "<br/>")
			.replace(/\{code\}(.+?)\{code\}|\{\{\{(.+?)\}\}\}/g,
				function(f, matches) {
					var c = arguments[1] || arguments[2];
					c = c.replace(/ /g, "&nbsp;")
					var rv = "<code class='prettyprint'>"
						+ prettyPrintOne(c)
						+ "</code>";
					k = k + 1;
					cache[k] = rv;
					return "(((tpdc.cache." + k + ")))"
				}
			)
			.replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
			.replace(/\*([^*]+)\*/g, "<i>$1</i>")
			.replace(/__([^_]+)__/g, "<u>$1</u>")
			.replace(/\[([^\[\]:]+)\]\(((http(s)?:)?[^\(\):]+)\)/g,
				"<a href=\"$2\">$1</a>")
			.replace(/\[((http(s)?:)?[^\[\]:]+)\]/g, "<a href=\"$1\">$1</a>")
			;

			while (cache[k]) {
				m = m.replace("(((tpdc.cache." + k + ")))", cache[k]);
				k--;
			}

			_t.messageNode.innerHTML = m;
		});

	}

	setType(this, 'TPDC.Message');

}; // TPDC.Message
TPDC.Message.templateMarkup = "<table style='width: 90%;'>" +
	"<tr>" +
	"<td data-id='image' style='width: 60px; text-align: center; vertical-align: top; padding: 5px;'></td>" +
	"<td style='vertical-align: top;'><b data-id='name'></b>" +
		"<div data-id='messageNode'></div>" +
	"</td></tr></table>"
;
Bind(TPDC.Message, 'tpdc:message');


TPDC.UnreadMessageCount = function() {
	var _t = this;

	this.update = function(c) {
		this.count = c || 0;
		this.countNode.innerHTML = this.count;
	}; // update()

	TPDC.API.getUnreadMessageCount_start(this.count || 0).returnTo(
		function(rv) {
			_t.update(Number(rv.count));
		}
	);

	this.style.fontSize = '11px';
};
TPDC.UnreadMessageCount.templateMarkup = 
	"<b>(<span data-id='countNode'>0</span> new)</b>"
;
Bind(TPDC.UnreadMessageCount, 'tpdc:unreadmessagecount');


TPDC.Comment = function() {
	this.comment_id = this['comment_id'] || 0;
	this.user_id = this['user_id'] || 0;
	this.message = this['message'] || "";
	this.created = this['created'] || new Date();

	this.draw = function() {
		this.innerHTML = [
			"<div>",
			"<span style='font-weight: bold;'>",
			"<a href='/profile?id=", this.user_id, "' class='deemphasized'>",
			this.name, "</a></span>",
			" - ",
			"<span style='font-style: italic;'>", this.message, "</span>",
			"</div>"
		].join('');
	} // draw()

	this.draw();

} // TPDC.Comment
Bind(TPDC.Comment, 'tpdc:comment');


TPDC.Comments = function() {

	if (!(this instanceof Node)) {
		return New(TPDC.Comments);
	}

	var that = this;

	// public properties
	this.count = 0;
	this.channel = this['channel'] || location.pathname;
	if (this.channel.match == '/') {
		this.channel = '/index';
	}

	// private properties
	// note: 'private' is a reserved word ... using "local" for now.
	var local = {
		expanded: false,
		high_id: -1,
		low_id: Math.pow(2,32)
	}

	// not sure why i did this ... 
	// ... commenting it out to see whether it's needed.
	// that's never been a bad idea ... 
	// this.local = local;


	//
	// subelements
	//

	local.commentsDiv = document.createElement('div');

	
	var commentForm = document.createElement('form');
	commentForm.style.display = 'none';
	commentForm.onsubmit = function() {
		local.post();
		return false;
	}

	var textbox = document.createElement('input');
	textbox.type = 'text';
	textbox.style.fontSize = '16px';
	textbox.style.width = '90%';
	commentForm.appendChild(textbox);

	var loadMore = document.createElement('a');
	loadMore.innerHTML = "(show)";
	loadMore.style.fontSize = '10px';
	loadMore.href = 'javascript:void();';
	loadMore.onclick = function(qty) {
		var qty = qty || null;
		local.getOlder(qty);
		if (TPDC.authenticatedUser) {
			commentForm.style.display = 'block';
		}
	}


	// public methods
	this.onclick = function() {
		// expanded = !expanded;
		// comments_node.visible = expanded;
	} // onclick()


	// local methods

	local.insertComments = function(comments) {
		if (comments.length > 0) {
			comments.sort(
				function(a, b) {
					return Number(a.comment_id) > Number(b.comment_id);
				}
			);

			// assume that all comments are either above the high id
			// or below the low id
			var greater = true;
			if (Number(comments[0].comment_id) < local.low_id) {
				comments.reverse();
				greater = false;
			}

			for (var i = 0; i < comments.length; i++) {
				var c = New(TPDC.Comment, comments[i]);

				c.comment_id = Number(c.comment_id);

				if (greater) {
					local.commentsDiv.appendChild(c);
				} else {
					local.commentsDiv.insertBefore(c, local.commentsDiv.firstChild);
				}

				local.high_id = Math.max(c.comment_id, local.high_id);
				local.low_id = Math.min(c.comment_id, local.low_id);

				if (window.console) console.log('inserting', c, 'onto', that);
			}
		}
	} // insertComments()


	local.getOlder = function(qty) {
		var qty = Number(qty) || 10;
		loadMore.innerHTML = "(show more)";
		TPDC.jsonp(
			'comment',
			{c: that.channel, id: local.low_id - 1, s: 0 - qty, t: that.token},
			function(r) {
				that.token = r.t;
				local.insertComments(r.comments);
				if (r.comments.length < qty) {
					loadMore.style.display = 'none';
				}
			}
		);
	} // olderSomethings()


	local.getNewer = function () {
		TPDC.jsonp(
			'comment',
			{c: that.channel, id: local.high_id + 1, s: 1000, t: that.token},
			function(r) {
				that.token = r.t;
				local.insertComments(r.comments);
			}
		);
	}

	local.post = function() {
		TPDC.jsonp(
			'comment',
			{
				c: that.channel,
				id: local.high_id + 1,
				s: 1000,
				m: textbox.value,
				t: that.token,
				n: that.notify
			},
			function(r) {
				that.token = r.t;
				local.insertComments(r.comments);
				textbox.value = '';
			}
		);
		return false;
	} // postSomething()


	// initalize
	this.innerHTML = "<b>comments</b> ";
	this.appendChild(loadMore);
	this.appendChild(local.commentsDiv);
	this.appendChild(commentForm);
	if (this.autoload && this.autoload > 0) {
		var _t = this;
		upon(function() { return TPDC.authenticatedUser; },
			function() { loadMore.onclick(_t.autoload); }
		);
	}
	// local.getOlder();

} // tpdc.comments
Bind(TPDC.Comments, 'tpdc:comments');


TPDC.PlaceNavigation = function() {

	this.iconImg.src = this.icon;

}; // TPDC.LinkedPlaces
TPDC.PlaceNavigation.templateMarkup = "<div>\
	<div data-id='iconDiv' style='width: 280px; display: inline-block; vertical-align: middle;'>\
		<img data-id='iconImg' class='distinct place-image' />\
	</div>\
	<div class='nav-signal'>&Rarr;</div>\
	<div data-id='placesDiv' class='places'>\
		<div data-id='places'></div>\
	</div>\
</div>";
Bind(TPDC.PlaceNavigation, 'tpdc:placenavigation');


TPDC.LinkedPlace = function() {
	this.icon.image_id = this.icon_id;
	this.icon.width = 64;
	this.icon.height = 32;
	this.link.href = "/place?id=" + this.place_id;

	if (this.removable) {
		this.removeLink.style.display = '';
		this.removeLink.onclick = function() {
		};
	}

	setType(this, 'TPDC.LinkedPlace');
}; // TPDC.LinkedPlace
TPDC.LinkedPlace.templateMarkup =
	"<a data-id='removeLink' style='display: none; float: right; color: red; font-weight: bold;'>X</a>" +
	"<a data-id='link'>" +
	"<tpdc:dbimage data-id='icon'></tpdc:dbimage>" +
	"<div data-id='name'></div>" +
	"</a>"
;
Bind(TPDC.LinkedPlace, 'tpdc:linkedplace');


TPDC.AddLinkedPlace = function() {
	var _t = this;

	this.show = function() {
		var all_items = ['closeButton','addLink','addForm'];
		for (var i = 0; i < all_items.length; i++) {
			this[all_items[i]].style.display = 'none';
		}
		for (var i = 0; i < arguments.length; i++) {
			this[arguments[i]].style.display = '';
		}
	}; // show()

	this.openForm = function() {
		this.show('addForm','closeButton');
	}; // open()

	this.closeForm = function() {
		this.show('addLink');
	}; // closeForm()

	this.loadResults = function(results) {
		this.searchResults.innerHTML = '';
		if (results && results.length > 0) {
			for (var i = 0; i < results.length; i++) {
				var place = New(TPDC.LinkedPlace, results[i]);
				place.onclick = function() {
					var a = {place_id: _t.place_id};
					var b = {place_id: this.place_id};
					TPDC.API.linkPlaces(a, b).returnTo(function(rv) {
						if (rv) {
							// TODO: umm ... not this:
							document.location.reload();
						} else {
							TPDC.Notify("Could not link places.", '');
						}
					});
					return false;
				};
				this.searchResults.appendChild(place);
			}
		} else {
			this.searchResults.innerHTML = "No places found.";
		}
		this.searchValue.value = '';
		this.show('addForm','closeButton');
	}; // openResults()

	this.closeResults = function() {
		this.show('addLink');
	}; // closeResults()

	this.addLink.onclick = function() {
		_t.openForm();
	}; // addLink.onclick()

	this.closeButton.onclick = function() {
		_t.show('addLink');
	}; // closeForm.onclick()

	this.searchForm.onsubmit = function() {
		TPDC.API.getPlaces(_t.searchValue.value).returnTo(function(rv) {
			_t.loadResults(rv);
		});
		return false;
	}; // searchForm.onsubmit()

	this.createNew.href = '/edit-place?link_to=' + this.place_id
		+ '&link_to_token=' + this.token;

	var sr = this.addForm;
	document.body.appendChild(sr);
	sr.style.display = 'none';
	sr.style.position = 'fixed';
	sr.style.width = '50%';
	sr.style.height = '50%';
	sr.style.top = '5%';
	sr.style.left = '25%';
	sr.style.padding = '20pt';
	sr.style.backgroundColor = '#fafafa';
	sr.style.border = '10px solid #f0f0f0';
	

}; // TPDC.AddLinkedPlace
TPDC.AddLinkedPlace.templateMarkup = 
	"<div data-id='addLink' style='cursor: pointer;'>" +
	"<span style='font-size: 24pt;'>+</span><br />" +
	"Add a Place</div>" +
	"<div data-id='addForm' style='display: none;'>" +
	"<form data-id='searchForm'>" +
	"<div data-id='closeButton' style='float: right; display: none; color: red; font-weight: bold; cursor: pointer; font-size: 20pt;'>X</div>" +
	"<a data-id='createNew'>Create New</a> or " +
	"<input type='text' data-id='searchValue' placeholder='Find existing ...' >" +
	"</form>" +
	"<div data-id='searchResults'></div>" +
	"</div>"
;
Bind(TPDC.AddLinkedPlace, 'tpdc:addlinkedplace');


TPDC.Things = function() {
	var _t = this;
	setType(this, 'TPDC.Things');

	this.getThings = function() {
		 return getNodes(this, TPDC.Thing);
	}; // getThings()

	this.add = function(thing) {
		this.things.appendChild(thing);
		thing.enableActions(this);
	}; // add()

	upon(function() { return TPDC.Thing; }, function() {
		var things = _t.getThings();
		for (var i = 0; i < things.length; i++) {
			if (things[i].enableActions) {
				things[i].enableActions(_t);
			}
		}
	});

}; // TPDC.Things
TPDC.Things.templateMarkup = '<div data-id="things"></div>';
Bind(TPDC.Things, 'tpdc:things');


TPDC.Thing = function() {
	var _t = this;

	setType(this, 'TPDC.Thing');

	this.enableActions = function(bag) {
		this.bag = bag;

		this.ondrop = function(mc, t) {
		}; // ondrop()

		this.ondropover = function(thing) {
			if (!this.accepts(thing)) return false;
			thing.hide();
			var a = {thing_id: this.thing_id, place_id: this.place_id};
			var b = {thing_id: thing.thing_id, place_id: thing.place_id};
			TPDC.API.thingAction([a, b]).returnTo(function(rv) {
				if (rv.error) {
					if (rv.edit) {
						window.location = rv.edit + "&return="
							+ encodeURIComponent(window.location);
					} else {
						TPDC.Notify("Whoa there!", rv.error);
						thing.return();
						thing.show();
					}
					// puts the dropped thing back
				} else {

					if (_t.getQuantity() <= 1) {
						_t.parentNode.removeChild(_t);
					} else {
						_t.setQuantity(_t.getQuantity() - 1);
					}

					if (thing.getQuantity() > 1) {
						thing.setQuantity(thing.getQuantity() - 1);
						thing.return();
						thing.show();
					}

					var things = [];
					var bag_things = _t.bag.getThings();
					for (var i = 0; i < rv.products.length; i++) {
						things.push(
							rv.products[i].quantity + " "
							+ rv.products[i].name
						);

						var found = false;
						for (var ei = 0; ei < bag_things.length; ei++) {
							var ct = bag_things[ei];
							if (ct.thing_id == rv.products[i].thing_id) {
								ct.setQuantity(
									1 * ct.getQuantity()
									+ 1 * rv.products[i].quantity
								);
								found = true;
								break;
							}
						}

						if (!found) {
							var ct = New(TPDC.Thing, rv.products[i]);
							ct.setQuantity(rv.products[i].quantity);
							_t.bag.add(ct);
						}
					}
					TPDC.Notify(
						rv.name,
						"Received: <i>" + things.join(", ") + "</i>"
					);
				}
			});
			return true;
		}; // ondropover()

		this.ondragover = function(thing) {
			if (this.accepts(thing)) {
				this.style.backgroundColor = 'yellow';
			}
		}; // ondragover()

		this.ondragout = function(thing) {
			this.style.backgroundColor = '';
		}; // ondragout()

		this.accepts = function(thing) {
			return isa(thing, 'TPDC.Thing');
		}; // this.accepts()

		TG.DropSpot.apply(this, arguments);
		TG.Draggable.apply(this);
	}; // enableActions()

	this.getQuantity = function() {
		return Number(this.quantity.innerHTML);
	}; // getQauntity()

	this.setQuantity = function(v) {
		this.quantity.innerHTML = v;
	}; // setQauntity()

	this.getName = function() {
		return this.name.innerHTML;
	}; // getName()

	this.setName = function(v) {
		this.name.innerHTML = v;
	}; // setName()

	this.icon.image_id = this.icon_id;
	this.icon.width = 64;
	this.icon.height = 64;
	this.sticky = true;

	this.link.href = "/thing?id=" + this.thing_id;

	if (this.removable) {
		this.removeLink.style.display = '';
		this.removeLink.onclick = function() {
		};
	}

}; // Thing
TPDC.Thing.things = [];
TPDC.Thing.templateMarkup =
	"<a data-id='removeLink' style='display: none; float: right; color: red; font-weight: bold;'>X</a>" +
	"<div data-id='box'>" +
		"<div data-id='quantityFloat' class='top right overlay'>X " +
			"<span data-id='quantity'></span>" +
		"</div>" +
		"<div data-id='handle' style='cursor: move;'>" +
			"<tpdc:dbimage data-id='icon'></tpdc:dbimage>" +
		"</div>" +
		"<a data-id='link'><span data-id='name'></span></a>" +
	"</div>" 
;
Bind(TPDC.Thing, 'tpdc:thing');


TPDC.UserMenu = function() {

	setType(this, 'TPDC.UserMenu');
	
	this.ondropover = function(thing) {
		if (!this.accepts(thing)) return false;
		thing.hide();
		var t = {
			thing_id: thing.thing_id,
			place_id: thing.place_id
		};
		TPDC.API.takeThing(t).returnTo(function(rv) {
			if (!rv || rv.error) {
				alert(rv.error);
				thing.return();
				thing.show();
			} else {
				TPDC.Notify('Item Collected', '1 ' + thing.getName());
				if (thing.getQuantity() <= 1) {
					thing.parentNode.removeChild(thing);
				} else {
					thing.setQuantity(thing.getQuantity() - 1);
					thing.return();
					thing.show();
				}
			}
		});
	}; // ondropover()

	this.ondragover = function(thing) {
		if (this.accepts(thing)) {
			this.style.backgroundColor = 'yellow';
		}
	}; // ondragover()

	this.ondragout = function(thing) {
		this.style.backgroundColor = '';
	}; // ondragout()

	this.accepts = function(thing) {
		return isa(thing, 'TPDC.Thing') && thing.place_id
			&& thing.mode && thing.mode != 'static';
	}; // this.accepts()

	TG.DropSpot.apply(this, arguments);

}; // TPDC.UserMenu
Bind(TPDC.UserMenu, 'tpdc-user-menu');


TPDC.DBImage = function() {
	var dims = '';
	var width = this.width || this.w || null;
	var height = this.height || this.h || null;
	if (width !== null || height !== null) {
		dims = '&w=' + (width || 1024) + '&h=' + (height || 1024);
	}

	var id = Number(
		this.icon_id || this.image_id || this['icon-id'] || this['image-id']
	);

	this.image.src = '/d-image?id=' + id + dims;

	/* TODO: Move to stylesheet */
	this.style.display = 'inline-block';
	this.style.padding = '0px';
	this.style.margin = '0px';
};
TPDC.DBImage.templateMarkup =
	"<img data-id='image' />"
;
Bind(TPDC.DBImage, 'tpdc:dbimage');



TPDC.RoughEdge = function() {

	this.setHoverColor = function(color) {
		this.outer_div.className = 'rough-edge ' + color;
	}; // setHoverColor()

	this.setHoverColor(this.hover || '');

	// copy children, rather than innerHTML, so they can be inserted into the
	// container without breaking their ties to javascript objects.
	for (var i = 0; i < this.parameters.length; i++) {
		if (isa(this.parameters[i], Node)) {
			this.container.appendChild(this.parameters[i]);
		}
	}

	this.container.style.padding = this.style.padding;
	this.style.padding = '0px';

	/*
	this.edgeOpacity = this['edge-opacity'] || 1.0;
	for (var i = 0; i < this.outer_div.childNodes.length; i++) {
		var n = this.outer_div.childNodes[i];
		if (n != this.container) {
			n.style.opacity = this.edgeOpacity;
		}
	}
	*/

} // tpdc.roughedge
TPDC.RoughEdge.templateMarkup = [
	"<div data-id='outer_div' class='rough-edge'>",
		"<div class='top horizontal edge'></div>",
		"<div class='right vertical edge'></div>",
		"<div class='bottom horizontal edge'></div>",
		"<div class='left vertical edge'></div>",
		"<div data-id='container' class='rough-edge-content'></div>",
	"</div>"
].join('');

Bind(TPDC.RoughEdge, 'tpdc-roughedge');
Bind(TPDC.RoughEdge, 'tpdc:roughedge');


TPDC.ToggledContent = function() {
	setType(this, 'TPDC.ToggledContent');

	var _t = this;

	this.setStyles = function() {
		if (this['data-content-visible'] === undefined) {
			this['data-content-visible'] = false;
		}

		var v = String(this['data-content-visible']);
		if (v == 'true' || v == '1') {
			this.content.style.display = '';
			this.showButton.style.display = 'none';
			this.hideButton.style.display = '';
		} else {
			this.content.style.display = 'none';
			this.showButton.style.display = '';
			this.hideButton.style.display = 'none';
		}
	}; // setStyles()

	this.showButton.onclick = function() {
		_t['data-content-visible'] = true;
		_t.setStyles();
	}; // showButton.onclick()

	this.hideButton.onclick = function() {
		_t['data-content-visible'] = false;
		_t.setStyles();
	}; // hideButton.onclick()


	this.setStyles();

}; // TPDC.ToggledContent()
TPDC.ToggledContent.templateMarkup =
	"<div><span data-id='content-title'></span>"
	+ " <span data-id='showButton' style='display: none; cursor: pointer;'>[+]</span>"
	+ " <span data-id='hideButton' style='display: none; cursor: pointer;'>[-]</span></div>"
	+ "<div data-id='content' style='display: none;'></div>"
;

Bind(TPDC.ToggledContent, 'tpdc-toggled-content');
Bind(TPDC.ToggledContent, 'tpdc:toggledcontent');


TPDC.RevealedContent = function() {
	setType(this, 'TPDC.RevealedContent');

	var _t = this;
	var cc = _t.contentContainer;
	var rbc = _t.revealButton;

	this.style.position = 'relative';

	cc.style.height = '0px';
	cc.style.transition = 'height 0.75s';

	upon(function() { return !_t.image || _t.image.complete; }, function() {
		rbc.style.height = _t.revealButton.offsetHeight + "px";
		rbc.style.transition = 'height 0.75s';
	});

	this.revealButton.onclick = function() {
		cc.style.height = _t.content.offsetHeight + "px";
		rbc.style.height = '0px';
	} // revealButton.onclick()

}; // TPDC.RevealedContent()
TPDC.RevealedContent.templateMarkup = 
	"<div data-id='revealButtonContainer' style='overflow: hidden;'>" +
		"<div data-id='revealButton' style='cursor: pointer; text-align: center;'>" +
			"<img data-id='image' src='/images/crystal-eyes-128px.png' style='opacity: 0.25; alpha: filter(opacity=25);'/>" +
			"<div data-id='caption'></div>" +
		"</div>" +
	"</div>" +
	"<div data-id='contentContainer' style='overflow: hidden'>" +
		"<div data-id='content'></div>" +
	"</div>" 
;
Bind(TPDC.RevealedContent, 'tpdc-revealed-content');
Bind(TPDC.RevealedContent, 'tpdc:revealedcontent');


TPDC.GrowingTextarea = function() {
	this.textarea.name = this.name;
	var _t = this;

	this.getValue = function() {
		return this.textarea.value;
	}; // getValue()

	this.clear = function() {
		this.textarea.value = '';
		this.textarea.onkeyup();
	}; // clear()

	this.textarea.onkeyup = function(e) {
		_t.sizer.style.width = this.offsetWidth + "px";
		_t.sizer.value = this.value;
		this.style.height = _t.sizer.scrollHeight + "px";
	}; // textarea.onchange()

	for (var i = 0; i < this.parameters.length; i++) {
		this.textarea.value += this.parameters[i].innerHTML;
	}

	document.body.appendChild(this.sizingContainer);

}; // TPDC.DynamicTextarea()
TPDC.GrowingTextarea.templateMarkup =
	"<div data-id='sizingContainer' style='width: 0px; height: 0px; overflow-x: hidden; overflow-y: hidden;'>" +
	"<textarea data-id='sizer'></textarea>" +
	"</div>" +
	"<textarea data-id='textarea' style='width: 100%; overflow-y: hidden;'></textarea>"
;
Bind(TPDC.GrowingTextarea, 'tpdc:growingtextarea');


TPDC.FartCounter = function() {

	var _t = this;
	this.trackable = false;

	this.farts = 0;
	this.userfarts = 0;

	this.setFarts = function(v) {
		_t.farts = v.total;
		_t.userfarts = v.user;
		_t.fartCount.innerHTML = v.total;
		_t.userCount.innerHTML = v.user;
	}; // setFarts()

	this.track = function() {
		TPDC.Farts.track();
	}; // track()

	this.setEnabled = function(v) {
		this.enabled = Boolean(v);
		this.trackButton.style.opacity = this.enabled ? '1' : '0.5';
		this.trackButton.style.filter = this.enabled ? 'alpha(opacity=100)'
			: 'alpha(opacity=50)';
	}; // setEnabled()

	this.isEnabled = function() {
		return Boolean(this.enabled);
	}; // isEnabled()

	this.trackButton.onmousedown = function(evt) {
		if (_t.isEnabled()) {
			_t.setEnabled(false);
			_t.track();
		}
		return false;
	};

	TPDC.Farts.getCounts().returnTo(function(rv) {
		_t.setFarts(rv);
		_t.setEnabled(true);
	});

	TPDC.Farts.onchange().returnTo(function(rv) {
		_t.setFarts(rv);
		_t.setEnabled(true);
	});

}; // TPDC.FartCounter
TPDC.FartCounter.templateMarkup = ""
	// + "<div data-id='fartCount'></div>"
	// + "<div data-id='trackButton'>Fart!</div>"
;
Bind(TPDC.FartCounter, 'tpdc:fartcounter');


// auth
TPDC.setUserMenu = function(o) {
	document.getElementById('user_menu').innerHTML = o['menu'];
	TPDC.authenticatedUser = o['user'];
}; // TPDC.setUserMenu()


// awarding
TPDC.award = function(q, i, t, m) {
	var title = t || "Item Collected";
	var message = m || String(q) + " " + String(i);
	return TPDC.awardMultiple([{
		quantity: q,
		item: i,
		title : t,
		message : m
	}]);
}; // TPDC.award()


TPDC.awardMultiple = function(awards) {
	var r = {
		token: TPDC.award.t,
		items: []
	};

	for (var i = 0; i < awards.length; i++) {
		r.items.push({
			item: awards[i].item,
			quantity: awards[i].quantity
		});
	}

	TPDC.jsonp('game', r, function(rv) {
		if (rv.new_token) {
			TPDC.award.t = rv.new_token;
		}

		for (var i = 0; i < awards.length; i++) {
			if (rv.awarded[awards[i].item]) {
				var title = awards[i].title || "Item Collected";
				var message = awards[i].message
					|| awards[i].quantity + " " + awards[i].item;
				TPDC.Notify(title, message);
			}
		}
	});

} // TPDC.awardMultiple()


TPDC.InstallLink = function() {
	var _t = this;
	this.icon_img.src = this.icon;
	if (TPDC.InstallLink.evt) {
		_t.classList.add('show');
		_t.addEventListener('click', (e) => {
			TPDC.InstallLink.evt.prompt();
			TPDC.InstallLink.evt.userChoice.then((choiceResult) => {
				if (choiceResult.outcome === 'accepted') {
					_t.classList.remove('show');
					console.log('User accepted the A2HS prompt');
				} else {
					console.log('User dismissed the A2HS prompt');
				}
				TPDC.InstallLink.evt = null;
			});
		});
	}
};
TPDC.InstallLink.templateMarkup = "\
	<hr />\
	<div class='button'>\
		<img data-id='icon_img' />\
		Install\
	</div>\
";
Bind(TPDC.InstallLink, 'tpdc:installlink');

window.addEventListener('beforeinstallprompt', (e) => {
	e.preventDefault();
	TPDC.InstallLink.evt = e;
});


if (this['FB']) {
	// catch Like's 
	FB.Event.subscribe('edge.create',
		function(response) {
			var cb = 'like.' + response;
			var f = TPDC.FacebookCallbacks;
			if (f && f[cb] && typeof(f[cb]) == 'function') {
				f[cb](response);
			}
		}
	);

	// catch UNLike's
	FB.Event.subscribe('edge.remove',
		function(response) {
			var cb = 'unlike.' + response;
			var f = TPDC.FacebookCallbacks;
			if (f && f[cb] && typeof(f[cb]) == 'function') {
				f[cb](response);
			}
		}
	);
}


// process the run-queue, if there is one
if (this['__tpdcq']) {
	this['__tpdcq'].push = function (f) {
		if (typeof(f) == 'function') {
			f();
		}
	}
	for (var i = 0; i < this['__tpdcq'].length; i++) {
		if (typeof(this['__tpdcq'][i]) == 'function') {
			this['__tpdcq'][i]();
		}
	}
} else {
	this['__tpdcq'] = {
		push : function (f) {
			f();
		}
	}
}
