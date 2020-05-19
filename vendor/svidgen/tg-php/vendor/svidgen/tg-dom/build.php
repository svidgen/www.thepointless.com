<?php

$options = [
	'quick::'
];
$cli_args = getopt(null, $options);

$artifacts = [
	[
		'dir' => 'src',
		'in' => 'tg-core.js',
		'out' => 'tg-core.js',
		'minify' => true,
	],
	[
		'dir' => 'src',
		'in' => 'tg-all.js',
		'out' => 'tg-all.js',
		'minify' => true,
	],
	[
		'dir' => 'tests',
		'in' => 'tg-all.js',
		'out' => 'tests.js',
	],
];

$preamble = file_get_contents('src/tg-require.js') . "\n";

$root = getcwd();
foreach ($artifacts as $artifact) {
	print "Writing dist/{$artifact['out']} ...\n";
	chdir($artifact['dir']);
	$output = $preamble . outputJS(file_get_contents($artifact['in']));

	chdir($root);
	file_put_contents("dist/{$artifact['out']}", $output);

	if (!isset($cli_args['quick']) && @$artifact['minify']) {
		$min_name = preg_replace("/(\.js)/", "-min.js", $artifact['out']);
		print "Writing dist/{$min_name} ...\n";
		$minified = minify($output);
		file_put_contents("dist/{$min_name}", $minified);
	}
}

print "done.\n";

function outputJS($data, $path = null, &$modules = [], &$jsmodules = []) {
	$includes = [];
	$mainModPath = '';
	if (preg_match_all(
		"/\\brequire\(\s*['\"](.+)['\"]\s*\)\s*;?/",
		$data,
		$matches,
		PREG_SET_ORDER
	)) {
		if ($path == null) {
			$path = getcwd();
			$modpath = modpath($path);
			$mainModPath = "tgmodule.setpath('{$modpath}');\n";
		}
		for ($i = 0; $i < sizeof($matches); $i++) {
			$modname = $matches[$i][1];
			$includes[] = writeJSInclude($modname, $path, $modules, $jsmodules);
		}
	}
	return join("\n", $includes) . $mainModPath . $data;
}

function writeJSInclude($modname, $path, &$modules, &$jsmodules) {
	$fullpath = modpath("{$path}/{$modname}");
	$newpath = dirname($fullpath);
	if (!isset($jsmodules[$fullpath])) {
		$jsmodules[$fullpath] = true;
		if (!is_file($fullpath)) {
			// output nothing.
		} else if (preg_match("/\.(js|php)$/", $modname)) {
			$module = getJSScriptInclude($fullpath, $modules, $jsmodules);
			return outputJS($module, $newpath, $modules, $jsmodules);
		} else {
			$module = getJSStringContent($fullpath, $modules, $jsmodules);
			return outputTxt($module);
		}
	}
}

function getJSScriptInclude($fullmodpath, &$modules, &$jsmodules) {
	$modpath = moddirname($fullmodpath);
	$modstart = "tgmodule.d('{$modpath}','{$fullmodpath}',function(module){\n";
	$modend = "});\n\n";
	$mod_output = getModule($fullmodpath, $modules, $jsmodules);
	$module = $modstart . $mod_output . $modend;
	return $module;
}

function getJSStringContent($fullname, &$modules, &$jsmodules) {
	$modpath = moddirname($fullname, $modules, $jsmodules);
	$modstart = "tgmodule.d('{$modpath}','{$fullname}',";
	$modend = ");\n\n";
	$data = file_get_contents($fullname);
	$module = $modstart
		. json_encode($data)
		. $modend
	;
	return $module;
}

function modpath($modname) {
	$root = getcwd();
	$pathCharsToIgnore = strlen($root);
	$fullmodpath = realpath($modname);
	return linuxify_path('.' . substr($fullmodpath, $pathCharsToIgnore));
}

function moddirname($modname) {
	$dir = dirname($modname);
	if ($dir == '.') {
		$dir = './';
	}
	return linuxify_path($dir);
}

function linuxify_path($path) {
	 return preg_replace("/\\\\/", "/", $path);
}

function getModule($src, &$modules, &$jsmodules) {
	$realsrc = realpath('./' . $src);
	$data = file_get_contents($realsrc);
	return $data;
}

function minify($data) {
	$postdata = http_build_query(
		array(
			'js_code' => $data,
			'compilation_level' => 'SIMPLE_OPTIMIZATIONS',
			'output_format' => 'text',
			'output_info' => 'compiled_code'
		)
	);

	$opts = array('http' =>
		array(
			'method'  => 'POST',
			'header'  => 'Content-type: application/x-www-form-urlencoded',
			'content' => $postdata
		)
	);

	$context  = stream_context_create($opts);
	$result = file_get_contents('https://closure-compiler.appspot.com/compile', false, $context);

	return $result;
}

?>
