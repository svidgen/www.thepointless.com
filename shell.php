<?php

//
// windows build of PHP doesn't have readline(), so `php -a` doesn't work.
// this can be used isntead.
//
// > php shell.php
// 

$fp = fopen("php://stdin", "r");
$in = '';
while($in != "quit") {
	echo "php> ";
	$in = trim(fgets($fp));
	try {
		eval ($in);
	} catch (\Exception $e) {
		print $e;
	}
	echo "\n";
}
   
?>