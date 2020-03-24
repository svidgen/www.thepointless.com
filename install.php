<?php

$bins = [
	'router.php',
	'cli.php',
	'configure.php',
	'run.php'
];

$already_installed = [];
$installed = [];

foreach ($bins as $bin) {
	if (file_exists($bin)) {
		$already_installed[] = $bin;
	} else {
		$contents = "<?php require('vendor/svidgen/tg-php/bin/{$bin}'); ?>";
		file_put_contents($bin, $contents);
		$installed[] = $bin;
	}
}

if (sizeof($installed) > 0) {
	print "These were installed:\n  * " . join("\n  * ", $installed) . "\n\n";
}

if (sizeof($already_installed) > 0) {
	print "These were already present:\n  * " . join("\n  * ", $already_installed) . "\n\n";
	print "If you wish to use tg-php's version of these files, remove them ";
	print "and re-run\ninstall.php.\n\n";
}

if (!file_exists('logs')) {
	print "Making log directory ...\n\n";
	mkdir('logs');
}

print "Done.\n\n";


function add_to_gitignore($names) {
	$gitignore = file_get_contents('.gitignore');
	foreach ($names as $name) {
		if (!preg_match("/^{$name}$/", $gitignore)) {
			$gitignore .= "\n{$name}";
		}
	}
	file_put_contents('.gitignore', $gitignore);
}

//
// was waffling between adding artifacts to .gitignore.
// currently thinking they shouldn't be added (at least not by default.)
//
// add_to_gitignore(array_merge(
// 	$bin,
// 	["vendor/svidgen"]
// ));
//

?>
