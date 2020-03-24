<?php

if (file_exists('./config.php')) {
	print "Already configured. Edit `config.php` or delete and re-run this script.";
	exit;
}

if (!function_exists('readline')) {
	function readline($prompt) {
		print $prompt;
		return stream_get_line(STDIN, 2048, PHP_EOL);
	}
}

$dbms = readline("Data adapter to use (`sqlite` (default) or `mysql`): ");
$database = readline("Database name to use (default to `deckbuilder`): ");
$database = $database ? $database : 'deckbuilder';

if ($dbms == 'mysql') {
	$host = readline("MySQL host to use (defaults to `localhost`): ");
	$user = readline("User to create or use (defaults to `deckbuilderuser`): "); 
	$pass = readline("Password for deckbuilder (default to random): ");

	$rootuser = readline(
		"Existing database admin user (defauls to `root`): "
	);
	$rootpass = readline("Database admin's password: ");

	$host = $host ? $host : 'localhost';
	$user = $user ? $user : 'deckbuilderuser';
	$pass = $pass ? $pass :  hash('md5', rand(1, PHP_INT_MAX));
	$rootuser = $rootuser ? $rootuser : 'root';
	$rootpass = $rootpass ? $rootpass :  '';

	$db = mysqli_connect($host, $rootuser, $rootpass);
	mysqli_query($db, "create database if not exists `{$database}` character set = utf8;");
	mysqli_select_db($db, $database);

	$table_create = file_get_contents(__DIR__ . '/../lib/documents.sql');
	mysqli_query($db, $table_create);

	mysqli_query($db, "create user '{$user}'@'{$host}';");
	mysqli_query($db, "set password for '{$user}'@'{$host}'=password('{$pass}');");
	mysqli_query($db, "grant ALL on {$database}.* to '{$user}'@'{$host}'");

	$config = <<<CONFIG
<?php
\$configuration = array(
	'data-adapter' => 'mysql',
	'host' => "{$host}",
	'user' => "{$user}",
	'pass' => "{$pass}",
	'database' => "{$database}",
	'debug' => false
);

global \$adapter;
\$adapter->configure(\$configuration);
?>
CONFIG;

} else {
	$db = new SQLite3("./data/{$database}.db");
	$ok = $db->exec(file_get_contents(__DIR__ . '/../lib/documents.sqlite.sql'));
	$db->close();

	if (!$ok) {
		print "SQLite error. Quitting...";
		exit();
	}

	$config = <<<CONFIG
<?php
\$configuration = array(
	'data-adapter' => 'sqlite',
	'database' => "{$database}",
	'debug' => false
);

global \$adapter;
\$adapter->configure(\$configuration);
?>
CONFIG;
}

file_put_contents('config.php', $config);

print "Done.\n\n";

?>
