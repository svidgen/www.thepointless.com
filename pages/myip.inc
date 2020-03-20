<?php


	//
	// PAGE DEETS
	//

	// get/set IP address
	if (isset($_GET['ip'])) {
		$ip = $_GET['ip'];
		$your_string = "";
	} else {
		$ip = $_SERVER['REMOTE_ADDR'];
		$your_string = "Your ";
	}
	$parts = preg_split('/\./', $ip);

	if (sizeof($parts) != 4) {
		header("Location: {$base_url}");
		return;
	}

	$bits = sprintf("%08b", $parts[0]);
	$bits .= sprintf("%08b", $parts[1]);
	$bits .= sprintf("%08b", $parts[2]);
	$bits .= sprintf("%08b", $parts[3]);
	$bits = strrev($bits);
	$bits = str_split($bits);

	// add null to the beginning of the array so that the actual
	// bits go from index 1 to 32.
	array_unshift($bits, null);

	// set page title
	$meta_title = "{$your_string}IP - {$ip}";


	//
	// FUNCTIONS
	//

	// rbits($n, $bits)
	// returns the reverse of the first $bits of (int)$n
	// ... i think.
	function rbits($n, $bits = 8) {
		$rv = (int)0;
		$n = (int)$n;

		for ($i = 0; $i < $bits; $i++) {
			// shift the return-value bits to the left once
			$rv = $rv << 1;

			// determine the rightmost bit of the given value
			$rb = $n & 1;

			// put the rightmost bit in the rightmost spot of the RV
			$rv = $rv | $rb;

			// shift the rightmost bit off the given value
			$n = $n >> 1;
		}

		return $rv;
	} // rbits()


	//
	// FETCHING IP DEETS
	//
	$cache_key = "myip_requests.{$ip}";
	if (function_exists('cache_exists') && cache_exists($cache_key)) {
		$cached_requests = cache_fetch($cache_key);
		$arin_whois = $cached_requests['arin_whois'];
		$org = $cached_requests['org'];
	} else {
		$arin_whois = json_decode(file_get_contents("https://whois.arin.net/rest/ip/{$ip}.json"), true);
		if (isset($arin_whois['net']) && isset($arin_whois['net']['orgRef'])) {
			$org = json_decode(file_get_contents($arin_whois['net']['orgRef']['$'] . '.json'), true);
		} else {
			$org = false;
		}

		$cached_requests = array(
			'arin_whois' => $arin_whois,
			'org' => $org
		);
		if (function_exists('cache_store')) {
			cache_store($cache_key, $cached_requests, 120);
		}
	}




	//
	// FACT DESCRIPTIONS
	//
	$fact_descriptions = array(
		'Owner *' => "The folks who <b>own <u>your SOUL</u></b> &mdash; err ... IP address.",
		'Secret Lair *' => "Where the owner hides out and decides your fate.",
		'Color' => "An accurately representative color based on top secret math.",
		'Emoticon' => "A precise representation of your emotional state."
	);


	//
	// BORING DETAILS
	//

	// let's pick and choose which bits of information we want before actually
	// building the table. why? ... oh, i dont know.
	$details = array();
	if ($org) {
		$details['Your Owner *'] = @$org['org']['name']['$'];
		$details['Their Secret Lair *'] = join("<br />\n", array(
			@$org['org']['streetAddress']['line']['$'],
			@$org['org']['city']['$']
				. ', ' . @$org['org']['iso3166-2']['$']
				. ' ' . @$org['org']['postalCode']['$'],
			@$org['org']['iso3166-1']['name']['$']
		))
		;
	}


	//
	// COLOR
	//

	// create a color for the IP address, using the least significant
	// 3 parts as the RGB color code.
	$r = sprintf("%02s", dechex($parts[0] ^ rbits($parts[1]) ^ $parts[2] ^ $parts[3]));
	$g = sprintf("%02s", dechex($parts[0] ^ $parts[2] ^ rbits($parts[2]) ^ $parts[3]));
	$b = sprintf("%02s", dechex($parts[0] ^ $parts[3] ^ $parts[2] ^ rbits($parts[3])));
	$color = "#{$r}{$g}{$b}";
	$details['Your Magic Color'] = "<table>
		<tr>
			<td style='padding-right: 10px;'>{$color}</td>
			<td style='background-color: {$color}; color: {$color}; width: 200px; height: 20px;' title='{$color}'>&nbsp;</td>
		</tr>
		</table>";


	//
	// EMOTICON
	//
	$hair = array('', '=', '=|', 'c|', '[|', '<|', '>');
	$eyes = array(':', ';');
	$nose = array('o', '', '', '', '-', '{', '[');
	$mouth = array('P', '(', ')', '|', '/', '\\', 'o', 'O');

	$emote = htmlentities($hair[(int)$parts[0] % sizeof($hair)]
		. $eyes[(int)$parts[1] % sizeof($eyes)]
		. $nose[(int)$parts[2] % sizeof($nose)]
		. $mouth[(int)$parts[3] % sizeof($mouth)] , ENT_QUOTES, 'UTF-8');

	$details['What we think you look like'] = "
		<!-- <div class='emote'>{$emote}</div> -->
		<div class='emote turned'>{$emote}</div>
		";


	//
	// EMOTICON testing
	// 
	if (isset($_GET['test-emotes']) && $_GET['test-emotes'] == 'okgo') {
		$details['Emoticon Test'] = '';
		$fact_desctriptions['Emoticon Test'] = "Testing ...";
		foreach ($hair as $h) {
			foreach ($eyes as $e) {
				foreach ($nose as $n) {
					foreach ($mouth as $m) {
						$details['Emoticon Test'] .=
						"<div class='emote turned'>"
						. htmlentities($h . $e . $n . $m, ENT_QUOTES, 'UTF-8')
						. "</div>\n"
						;
					}
				}
			}
		}
	}


	//
	// build the table.
	//
	$t = array('<div class="xfact_sheet">');
	foreach ($details as $k => $v) {
		if ($v) {
			$t[] = "<div class='fact'>";
			$t[] = "<div class='fact_name'>{$k}</div>";
			// $t[] = "<div class='fact_description'>{$fact_descriptions[$k]}</div>";
			$t[] = "<div class='fact_data'>{$v}</div>";
			$t[] = "<div style='clear: left;'></div>";
			$t[] = "</div>";
		}
	}
	$t[] = '</div>';


	// turn table array into HTML
	$t_html = join("\n", $t);



?>
<style type='text/css'>
	.emote {
		font-size: 32px;
		width: 100px;
		float: left;
		padding: 5px;
		margin: 5px;
		height: 100px;
		border: 0px solid silver;
	}

	.turned {
		-webkit-transform: rotate(90deg);
		-moz-transform: rotate(90deg);
		-o-transform: rotate(90deg);
		-ms-transform: rotate(90deg);
		transform: rotate(90deg);
	}
</style>

<h2>You: <span style='color: #006600; font-weight: bold;'><?php print $ip; ?></span></h2>

<?php print $t_html; ?>

<div style='font-size: small; color: gray; margin-top: 2em;'>* Provided by <a href='https://www.arin.net/' target='_blank' style='color: gray; text-decoration: underline;'>ARIN</a>. Nice guy, but refer to his <a href='https://www.arin.net/whois_tou.html' target='_blank' style='color: gray; text-decoration: underline;'>Terms of Service</a> before using his 411.</div>


