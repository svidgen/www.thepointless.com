<?php

// default configuration.
$configuration = array(
	'data-adapter' => 'sqlite',
	'host' => 'n/a',
	'user' => 'n/a',
	'pass' => 'n/a',
	'database' => 'pointless',
	'debug' => true,
	'analytics-id' => '',
);

global $adapter;
$adapter->configure($configuration);

// config overrides are read from the docroot's parent directory.
@include_once(DOCROOT . '/config.php');

?>
