${meta({
	title: "Our Test Page"
})}

Words *underneath*.

**Bold words.**

<div id='count'></div>

<script>

let outputNode = document.getElementById('count');
// outputNode.innerHTML = "st <b>testing</b>";

function is_even_number(some_number) {
	let remainder = some_number % 2;
	if (remainder === 0) {
		return true;
	} else {
		return false;
	}
}

let currentOutput;
let x = 0;
while (x < 1000) {
	x = x + 1;

	if (is_even_number(x)) {
		currentOutput = outputNode.innerHTML;
		outputNode.innerHTML = currentOutput + " " + x;
	}
}

</script>

<script src="https://gist.github.com/svidgen/15d299fb9a8636f5f985cc6ad3c51a98.js"></script>
