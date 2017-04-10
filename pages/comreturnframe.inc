<?php

	$require_theme = 'php';

?>
<!doctype html>
<html>
	<body>
		<script type='text/javascript'>

			var receive = function (m) {
				// alert(m);
				top.receive(m);
			} // receive()


			if (window["onhashchange"]) {
				onhashchange = function() { receive(window.location.hash); };
			} else {
				setInterval(function() {
					var m = window.location.hash;
					window.location.hash = '';
					if (m != null && m != '') {
						receive(m);
					}
				}, 50);
			}

		</script>
	</body>
</html>
