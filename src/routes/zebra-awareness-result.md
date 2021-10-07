${meta({
	title: "zebra test RESULTS"
})}
<style type='text/css'>
.img_overlay {
	position: relative;
	padding: 0px;
}

.img_overlay .base {
	width: 100%;
	margin: 0px;
}

.img_overlay .overlay {
	position: absolute;
	top: 0px;
	left: 0px;
	width: 100%;
	height: 100%;
	margin: 0px;
	opacity: 0.7;
	filter: alpha(opacity=70);
}

.padded {
	padding: 10px 20px;
}
</style>

<div><tpdc:zebratestresult></tpdc:zebratestresult></div>
<div><tpdc:share
	url="/zebra-awareness"
	title="Zebra Awareness"
	text="Zebras are all around us and we don't even acknowledge them. Raise awareness, and GET TESTED."
	image="/images/zebratest/zebra.png"
></tpdc:share></div>

<script type='text/html' id='tpdc:zebratestresult'>
	<tpdc:zebratestresult>
		<div class='img_overlay' style='width: 256px; margin: 20px auto;'>
			<img src='/images/zebratest/zebra.png' class='base' />
			<img data-id='overlay_url' data-property='src' class='overlay' />
		</div>
		<h3 style='color: purple; text-align: center;' data-id='result'></h3>
		<div class='padded' data-id='explanation'></div>
	</tpdc:zebratestresult>
</script>

<script>
	const template = document
		.getElementById('tpdc:zebratestresult')
		.innerHTML
		.trim()
	;

	console.log(template);
	const ZebraTestResult = DomClass(template, function() {
		const zebra_url = "/images/zebratest/zebra.png";
		const red_x_url = "/images/zebratest/red_x.png";
		const checkmark_url = "/images/zebratest/green_check.png";
		const question_mark_url = "/images/zebratest/question_mark.png";

		let score = 0;

		const question_values = {
			q1: 2,
			q2: 2,
			q3: 2,
			q4: 2,
			q5: 1
		};

		const url = new URL(location).searchParams;
		for (let k in question_values) {
			score += (url.get(k) == '1' ? question_values[k] : 0);
		}
			
		// award_and_notify("Zebra Awareness Pin", 1, 3);
		if (score == 0) {
			this.result = "You <u>are</u> a zebra.";
			this.plain_result = "You are a zebra.";
			this.share_results = "Uh oh. I might be a zebra.";
			this.overlay_url = checkmark_url;
			this.explanation = "Your responses are unmistakable. Remember, being a zebra is nothing to be ashamed of. However, this does put you at a great disadvantage in a society littered with zebra discrimination. Remember to seek the support of your family and friends. More importantly, spread zebra awareness!";
			// award_and_notify("Postive Test Result", 1, 3);
		} else if (score == 1) {
			this.result = "You <u>might</u> be a zebra.";
			this.plain_result = "You might be a zebra.";
			this.share_results = "Uh oh. I might be a zebra.";
			this.overlay_url = question_mark_url;
			this.explanation = "The results are inconclusive! It would be best if you could <a href='/zebra-awareness-test'>retake the test</a> to ensure you answered all of the questions correctly. We can't have zebras walking around thinking they're people ...";
			// award_and_notify("Inconclusive Test Result", 1, 3);
		} else {
			this.result = "You are <u>not</u> a zebra.";
			this.plain_result = "You are not a zebra.";
			this.share_results = "Woot! I am not a zebra. (No offense to zebras!!!)";
			this.overlay_url = red_x_url;
			this.explanation = "This is great news! Free from the burdens and discriminations of zebrahood, you will find it easy to adhere to human activities such as shaking hands and driving cars. You can breath easy. But, spread the awareness: anyone you know could unwittingly be a zebra.";
			// award_and_notify("Negative Test Result", 1, 3);
		}
	});
</script>
