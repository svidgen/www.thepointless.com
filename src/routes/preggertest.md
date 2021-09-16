${meta({
	title: "Online Pregnancy Test"
})}
<style type='text/css'>

	.testbutton {
		display: inline-block;
		cursor: pointer;
		border: 0.25rem solid #f5d0d0; 
		background-color: #f0f5ff;
		margin: 2rem auto 4rem;
		padding: 0.75rem;
		text-align: center;
		font-weight: bold;
	}

	.testbutton:hover {
		background-color: white;
	}

	.testcontainer {
		margin: 1.5rem auto;
		padding: 2rem;
		border: 2px solid #d0d5ff;
		max-width: 450px;
		max-height: 52px;
	}

	.testcontainer img {
		width: 100%;
		height: 100%;
	}

	/* should this be on the main sheet? */
	.modal {
		position: fixed;
		display: table-cell;
		text-align: center;
		vertical-align: middle;
		overflow: hidden;
		top: 0px;
		left: 0px;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 3em 0 0 0 ;
		background-color: #ffffff;
		opacity: 0.8;
		filter: alpha(opacity=80);
	}

</style>

<script type='text/javascript'>

	// TODO: Rewrite with DomClass

	var think_div = false;

	function dotest() {
		if (think_div) {
			return true;
		}
		
		think_div = document.createElement('div');
		think_div.innerHTML = "Just a sec ...<br /><br /><img src='/images/please_wait.gif' />";
		think_div.style.fontSize = '3rem';
		think_div.className = 'modal';
		document.body.appendChild(think_div);

		var submittimeout = setTimeout(
			function() {
				think_div.innerHTML = "No urine detected!<br /><br />Please <a href='javascript:clearresult();'>try again</a>.";

				// plug into new inventory system when available.
				// TPDC.awardMultiple([
				// 	{quantity: 1, item: 'Pregnancy Test Result'},
				// 	{quantity: 1, item: 'Inconclusive Test Result'}
				// ]);
			},
			4000
		);

		return false;
	} // dotest()


	function clearresult() {
		if (think_div) {
			document.body.style.overflow = "scroll";
			think_div.parentNode.removeChild(think_div);
			think_div = false;
		}
	} // clearresult()


	function setColor(id, color) {
		var n = document.getElementById(id);
		if (n) {
			n.style.color = color;
		}
	} // setColor()
</script>

<div>Using the sensors in your keyboard, we are now able to remotely triangulate your hormone levels and detect the faint, early indicators of pregnancy.</div>
<div class='testcontainer'>
	<img src='/images/preggertest.png' style='border: 0px; margin: 0px;' />
</div>
<div>It's easy:
	<ol>
		<li>Just <b>urinate</b> on your keyboard or mobile device. <a href='#footnote_1' style='cursor: pointer; font-weight: bold;' onmouseover="setColor('footnote_1', '#cc0000');" onmouseout="setColor('footnote_1', 'gray');">*</a></li>
		<li>Wait <b>2 minutes</b>.</li>
		<li>Click the <b>Am I Preggerz?</b> button.</li>
		<li><i>Disregard all results reported after 5 minutes!</i></li>
	</ol>
</div>
<div style='text-align: center;'>
	<div class='testbutton' onclick='dotest();'>Am I Preggerz?</div>
</div>
<div style='margin: 30px auto; text-align: center;'>
	<tpdc:share text="It's never too soon (or LATE) to know if you're preggerz. Get tested online TODAY."></tpdc:share>
</div>
<div id='footnote_1' style='color: gray; font-size: small;'><b>*</b> If it is physically difficult for you to urinate on your keyboard or mobile device, you may also submerge it in a urine-filled toilet.</div>
