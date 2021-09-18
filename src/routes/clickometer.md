${meta({
	title: "the clickometer"
})}
<div>
	Our Clickometer is the most sophisticated click-analysis tool on the net.
	<ol>
		<li>Click or Tap the <b>Clickometer</b> as many times as you can in <span style='color: #993333; font-weight: bold; text-decoration: underline; font-style: italic;'>five seconds</span>.</li>
		<li>Brace yourself.</li>
		<li>And <b>Get Your Results</b>.</li>
	</ol>
</div>

<style type='text/css'>
	#clickocontainer {
		margin: 1.5rem;
		padding: 1.5rem;
		border: 2px solid #aaddff;
		background-color: #f5faff;
	}
	
	#meter {
		position: relative;
		width: 90%;
		height: 4rem;
		border: 2px black solid;
		margin: 1.25rem auto;
		padding: 0px;
		background-color: #fcfcfc;
	}

	#meter_bar {
		position: absolute;
		width: 0%;
		height: 100%;
		background-color: red;
		z-index: 1;
	}

	#timer {
		position: absolute;
		width: 100%;
		margin: 0.75rem auto;
		padding: 0px;
		font-size: 3rem;
		font-weight: bold;
		text-align: center;
		color: #000000;
		z-index: 2;
	}

	.click-overlay {
		position: absolute;
		width: 100%;
		height: 100%;
		background-color: transparent;
		z-index: 3;
	}
</style>

<div id='clickocontainer'>
	<div id='meter'>
		<div id='timer'><span style='font-size: 1.25rem; color: #883333;'>Click <u><i>here</i></u>!</span></div>
		<div id='meter_bar'>
		</div>
		<div id='click-target' class='click-overlay'
			onclick="clickometer_pump(1);" ondblclick="clickometer_pump(2);"
		></div>
	</div>
	<form
		style='text-align: center;'
		id='clickometer_form'
		name='clickometer'
		action='/clickometer_r'
		method='POST'
	>
		<input id='submit_button' type='submit' class='toggleable_button'
			value='Get Your Results' disabled='disabled' />
	</form>
</div>

<div id='click_tracker'></div>

<script type='text/javascript' src='./clickometer.js'></script>

