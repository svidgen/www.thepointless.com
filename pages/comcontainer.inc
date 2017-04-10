<iframe id='channel_out' src='http://local.svidgen.com/comframe?target=http://local.thepointless.com/comreturnframe'></iframe>
<input id='send_message' type='button' value="Send Message" />
<script type='text/javascript'>
	var channel_out = document.getElementById('channel_out');

	document.getElementById('send_message').onclick = function() {
		channel_out.src = 'http://local.svidgen.com/comframe?target=http://local.thepointless.com/comreturnframe#something-' + (new Date()).getTime();
	}

	var receive = function(m) {
		m = m.substr(1);
		alert(m + " received by top.");
	} // receive()
</script>
