<!doctype html>
<html>
	<head>
		<title>image size backfiller</title>
	</head>
	<body>
		<h3>Google infoWindow Preprocessor</h3>
		<div>Sets image height/width attributes and, in some browsers, corrects tag abnormalities.</div>

		<div style='width: 500px; margin-top: 10px;'>
			<div>Put some HTML here:<br />
				<textarea id='in' style='width: 100%; height: 250px;'>&lt;h4&gt;test&lt;/h4&gt;
&lt;div&gt;test ...
   &lt;img src='http://www.thepointless.com/images/big_giant.png'/&gt;
... ok.&lt;/div&gt;
&lt;img src='http://www.svidgen.com/images/logo.png'/&gt;</textarea>
			</div>
			
			<div style='text-align: right;'>
				<input type='button' onclick="processHTML(document.getElementById('in').value);" value='Process' />
			</div>
			
			<div>OUT:<br />
				<textarea id='out' style='width: 100%; height: 250px;' readonly='readonly'></textarea>
			</div>
		</div>
		
		<script type='text/javascript'>
		
			var __n = document.createElement('div');
			// __n.style.display = 'none';
			__n.style.opacity = 0.0;
			__n.style.filter = 'alpha(opacity=0)';
			document.body.appendChild(__n);
			
			var processHTML = function(html) {
				// load the HTML into the processing div.
				var out = document.getElementById('out');
				__n.innerHTML = html;
				
				// grab all the images
				var images = __n.getElementsByTagName('img');
				var __image_count = images.length;
				for (var i in images) {
					var img = images[i];
					img.onload = function() {
						this.width = this.offsetWidth;
						this.height = this.offsetHeight;
						__image_count--;
						
						// only produce an output once all of the images have loaded
						if (__image_count <= 0) {
							out.value = __n.innerHTML;
						}
					}
				}
				
				// if no images were found, just dump the output now.
				if (__image_count == 0) {
					out.value = 'no images? ' + __n.innerHTML;
				}
				
			} // processHTML()
			
		</script>
		
	</body>
</html>