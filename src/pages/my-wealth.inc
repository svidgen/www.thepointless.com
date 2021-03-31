<?php 

$items = array(
	1 => array(
		'name' => 'soda',
		'unit' => 'cans of soda'
	),
);

if (isset($_GET['i'])) {
	$id = (int)$_GET['i'];
	if (isset($items[$id])) {
		$item = $items[$id];
	} else {
		$item = $items[1];
	}
} else {
	$item = $items[1];
}

$meta_title = "your wealth in {$item['name']}";

?>

<script type='text/javascript'>

var item = "<?php print htmlentities($item['unit'], ENT_QUOTES, 'utf-8'); ?>";

var process = function(f) {
	// document.getElementById('out').innerHTML = f.dollars.value;
	var unit = f.size.value / 12;
	var salary = unit * (f.dollars.value / f.price.value);
	salary = Math.floor(salary);
	document.getElementById('out').innerHTML = String(salary) + " " + String(item);
	return false;
} // process()

</script>

<div>Use US dollars and units.</div>
<form name='salary' action='<?php print $_SERVER['REQUEST_URI']; ?>' onsubmit='return process(this);'>

	<div class='spaced'><b>What is your current annual salary?</b>
		<br />$ <input type='text' name='dollars' value='50000' style='width: 150px;' />
	</div>

	<div class='spaced'><b>What is price of a soda in the nearest vending machine?</b>
		<br />$ <input type='text' name='price' value='0.60' style='width: 150px;' />
	</div>

	<div class='spaced'><b>What size sodas does the machine serve?</b>
		<br /><select name='size'>
			<option value='12'>cans</option>
			<option value='20'>bottles</option>
		</select>
	</div>

	<div class='spaced'><b>You ready?</b>
		<br /><input type='submit' value='Yeah.' />
	</div>

</form>

<div id='out'></div>
