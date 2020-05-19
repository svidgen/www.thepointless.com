<?php

define('TG_ROOT', realpath(__DIR__ . '/..'));
define('TG_LIBDIR', TG_ROOT. '/lib');
define('PKGROOT', getcwd());
define('DOCROOT', $_SERVER['DOCUMENT_ROOT']);
define('LIBDIR', PKGROOT . '/lib');
define('TEMPLATE_DIR', PKGROOT . "/templates");

// stop session_start() from trying to control cache headers
ini_set('session.cache_limiter', 'off');

// use zlib on-the-fly compression
ini_set('zlib.output_compression', '1');

// level between 1 and 9 or -1 to let server decide
ini_set('zlib.output_compression_level', '-1');

// TODO: make this contingent on debug flag
ini_set('display_errors', '1');


class HttpAdapter {

	public $configuration = [];

	private $mimeTypes = [
		''      => 'text/html',
		'txt'   => 'text/plain',
		'htm'   => 'text/html',
		'tpl'   => 'text/html',
		'html'  => 'text/html',
		'php'   => 'text/html',
		'md'    => 'text/html',
		'js'    => 'text/javascript',
		'css'   => 'text/css',
		'json'  => 'text/json',
		'jpg'   => 'image/jpeg',
		'jpeg'  => 'image/jpeg',
		'png'   => 'image/png',
		'svg'   => 'image/svg+xml',
		'gif'   => 'image/gif',
		'bmp'   => 'image/bitmap',
		'ico'   => 'image/x-icon',
		'*'	    => 'application/octet-stream'
	];

	private $blockedPaths = [
		"/\/private\//",    // folders called private
		"/\/vendor\//",     // folders called private
		"/\/\./",           // hidden folders and files
	];

	private $cachedTypes = [
		'bmp',
		'css',
		'gif',
		'ico',
		'jpeg',
		'jpg',
		'js',
		'png',
		'svg',
	];

	private $internalResources = [
		'/~tg-php/tg-core.js' => 'vendor/svidgen/tg-dom/dist/tg-core.js',
		'/~tg-php/tg-core-min.js' => 'vendor/svidgen/tg-dom/dist/tg-core-min.js',
		'/~tg-php/tg-all.js' => 'vendor/svidgen/tg-dom/dist/tg-all.js',
		'/~tg-php/tg-all-min.js' => 'vendor/svidgen/tg-dom/dist/tg-all-min.js',
	];

	private $mimeType;
	private $extension;

	private $modules = array();
	private $modulePersistence = array();
	private $jsmodules = array();

	public function output($v) {
		$serializer = new \TG\Serializer();
		print $serializer->serialize($v);
	}

	public function outputRaw($data) {
		$this->outputCachingHeaders();

		if ($this->extension == 'js') {
			require_once(TG_ROOT . '/vendor/svidgen/tg-dom/src/tg-require.js');
			$this->outputJS($data);
			return;
		}

		if ($this->extension == 'css') {
			$this->outputCSS($data);
			return;
		}

		if ($this->extension == 'md') {
			$this->outputMarkdown($data);
			return;
		}

		print $data;
	}

	public function outputCachingHeaders() {
		if (in_array($this->extension, $this->cachedTypes)) {
			$age = 60 * 60 * 24 * 365;
			$expires = time() + $age;
			header("Cache-control: max-age={$age}");
			header('Pragma: cache');
			header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', $expires));
		}
	}

	public function extractVars($markdown) {
		$vars = array();
		preg_match_all("/<!-- +(.+)=(\"|')(.+)\\2 +-->/", $markdown, $matches, PREG_SET_ORDER);
		foreach ($matches as $match) {
			$vars[$match[1]] = $match[3];
		}

		return $vars;
	}

	public function extractTitle($markdown) {
		if (preg_match("/^#\s+(.+)$/m", $markdown, $match)) {
			return trim($match[1]);
		} else {
			return "";
		}
	}

	public function outputMarkdown($data) {
		global $configuration;

		require_once('util.php');
		$version = code_version();
		$page = $this->extractVars($data);
		if (!isset($page['title'])) {
			$page['title'] = $this->extractTitle($data);
		}

		require_once('parsedown.php');
		$Parsedown = new Parsedown();
		$page['content'] = $Parsedown->text($data);
		$configuration = $this->configuration;

		if (isset($page['template'])) {
			$template = $page['template'];
		} else {
			$template = 'default';
		}


		$template = TEMPLATE_DIR . "/{$template}.php";
		if (file_exists($template)) {
			require_once($template);
		} else {
			require_once(TG_ROOT . "/lib/basic-md-template.php");
		}

		return;
	}

	public function outputTxt($data) {
		print $data;
	}

	public function outputStatic($data) {
		$this->outputCachingHeaders();
		print $data;
	}

	public function outputCSS($data, $path = null) {
		$css = preg_replace_callback(
			"/@import\s+['\"](.*)['\"]\s*;/",
			function($matches) use ($path) {
				$this->writeCSSInclude($matches[1], $path);
				return "";
			},
			$data
		);
		print $css;
	}

	public function writeCSSInclude($src, $path = null) {
		if ($path == null) {
			$path = dirname($_SERVER['REQUEST_URI']);
			if ($path != '.') {
				$path = '.' . $path;
			}
		}

		$fullpath = $this->modpath("{$path}/{$src}");
		if (file_exists($fullpath)) {
			$this->outputCSS(
				file_get_contents($fullpath),
				$this->moddirname($fullpath)
			);
			print "/*** included '{$fullpath}' ***/\n\n";
		} else {
			print "/*** INCLUDE NOT FOUND: '{$fullpath}' ***/\n\n";
		}

		print "\n";
	}

	public function outputJS($data, $path = null) {
		$mainModStart = '';
		$mainModEnd = '';

		if ($path == null) {
			$path = dirname($_SERVER['REQUEST_URI']);
			if ($path != '.') {
				$path = '.' . $path;
			}
			$modpath = $this->modpath($path);
			$module = ".{$_SERVER['REQUEST_URI']}";
			$mainModStart = // "tgmodule.setpath('{$modpath}');\n"
				// .
				"tgmodule.d('{$modpath}','{$module}',function(module){\n";
			;
			$mainModEnd = "});\n\n";;
		}

		if (preg_match_all(
			"/\\brequire\(\s*['\"](.+)['\"]\s*\)\s*;?/",
			$data,
			$matches,
			PREG_SET_ORDER
		)) {
			for ($i = 0; $i < sizeof($matches); $i++) {
				$modname = $matches[$i][1];
				$this->writeJSInclude($modname, $path);
			}
		}

		print $mainModStart . $data . $mainModEnd;
	}

	public function writeJSInclude($modname, $path) {
		$fullpath = $this->modpath("{$path}/{$modname}");
		$newpath = dirname($fullpath);

		if (!isset($this->jsmodules[$fullpath])) {
			$this->jsmodules[$fullpath] = true;
			// if (!is_file($fullpath)) {
				// print "// could not find `{$path}/{$modname}`\n";
			// } else
			if (preg_match("/\.(js|php)$/", $modname)) {
				$module = $this->getJSScriptInclude($fullpath);
				$this->outputJS($module, $newpath);
			} else {
				$module = $this->getJSStringContent($fullpath);
				$this->outputTxt($module);
			}
		}
	}

	public function getJSScriptInclude($fullmodpath) {
		ob_start();
		$modpath = $this->moddirname($fullmodpath);
		$modstart = "tgmodule.d('{$modpath}','{$fullmodpath}',function(module){\n";
		$modend = "});\n\n";

		$mod_rv = $this->getModule($fullmodpath);
		$mod_output = ob_get_contents();
		if (is_object($mod_rv)) {
			$serializer = new \TG\APIIncludeSerializer();
			$mod_output = $serializer->serialize($mod_rv, $this);
		}

		$module = $modstart . $mod_output . $modend;
		ob_end_clean();
		return $module;
	}

	public function getJSStringContent($fullname) {
		$modpath = $this->moddirname($fullname);
		$modstart = "tgmodule.d('{$modpath}','{$fullname}',";
		$modend = ");\n\n";

		$data = file_get_contents($fullname);
		$module = $modstart
			. json_encode($data)
			. $modend
		;

		return $module;
	}

	public function modpath($modname) {
		$root = realpath(DOCROOT);
		$pathCharsToIgnore = strlen($root);
		$fullmodpath = realpath($modname);
		$rv = $this->linuxify_path('.' . substr($fullmodpath, $pathCharsToIgnore));
		return $rv;
	}

    public function URI($filename) {
        $modpath = $this->modpath($filename);
        $modpath = substr($modpath, 1);
        return "//{$_SERVER['HTTP_HOST']}{$modpath}";
    }

	public function moddirname($modname) {
		$dir = dirname($modname);
		if ($dir == '.') {
			$dir = './';
		}
		return $this->linuxify_path($dir);
	}

	public function linuxify_path($path) {
		 return preg_replace("/\\\\/", "/", $path);
	}

	public function is_bot_request() {
		if (isset($_SERVER['HTTP_USER_AGENT'])) {
			return preg_match(
				'/bot|crawl|slurp|spider|mediapartners|facebookexternalhit/i',
				$_SERVER['HTTP_USER_AGENT']
			);
		} else {
			return false;
		}
	}

	public function is_markup_request() {
		if ($this->mimeTypes[$this->extension] == 'text/html') {
			return true;
		} else {
			return false;
		}
	}

	public function is_prerender_request() {
		if ($this->is_bot_request() && $this->is_markup_request()) {
			return true;
		} else {
			return false;
		}
	}

	public function request_uri() {
		$proto = 'http';
		if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
			$proto = 'https';
		}

		$host = $_SERVER['HTTP_HOST'];
		$path = $_SERVER['REQUEST_URI'];

		return "{$proto}://{$host}{$path}";
	}

	public function execute($filename) {
		$this->setMimeType($filename);

		if ($this->is_prerender_request()) {
			$url = $this->request_uri();
			$puppet = DOCROOT . '/vendor/ssr/puppet.js';
			$cmd = "node {$puppet} \"{$url}\"";
			$this->outputRaw(shell_exec($cmd));
			return;
		}

		$rv = null;

		if ($this->extension == 'php') {
			ob_start();
			$rv = $this->getModule($filename);
			$command_stdout = ob_get_contents();
			ob_end_clean();
		} else {
			$command_stdout = file_get_contents(DOCROOT . '/' . $filename);
		}

		$this->outputRaw($command_stdout);

		if ($rv) {
			$prior_state = $this->getState($filename);
			if ($prior_state) {
				$rv = $prior_state;
			}
			$this->output($rv);
			$this->setState($filename, $rv);
		}

		session_write_close();
	}

	public function log($logname, $message, $debug = false) {
		if ($debug || $this->configuration['debug']) {
			file_put_contents(
				DOCROOT . "/logs/{$logname}.log",
				date('r') . "\n". print_r($message, 1) . "\n\n",
				FILE_APPEND
			);
		}
	}

	public function setMimeType($filename) {
		$this->extension = '';
		$this->mimeType = $this->mimeTypes['*'];

		if(preg_match("/\.([a-zA-Z0-9]+)$/", $filename, $matches))
			$this->extension = $matches[1];

		if (isset($this->mimeTypes[$this->extension]))
			$this->mimeType = $this->mimeTypes[$this->extension];

		header("Content-type: {$this->mimeType}");
	}

	public function configure($c) {
		foreach ($c as $k => $v) {
			$this->configuration[$k] = $v;
		}
	}

	public function provide($o, $options = array()) {
		$trace = debug_backtrace();
		$src = realpath($trace[0]['file']);
		$this->modules[$src] = $o;
		$this->modulePersistence[$src] = isset($options['persistent']) ?
			(bool)$options['persistent'] : true
		;
	}

	public function getModule($src) {
		$realsrc = realpath(DOCROOT . '/' . $src);
		$realsrc = $realsrc ? $realsrc : realpath(DOCROOT . '/' . $src);
		include_once($realsrc);	
		$module = @$this->modules[$realsrc];
		return $module;
	}

	public function getState($src, $relativeTo = './') {
		$realsrc = realpath($relativeTo . $this->linuxify_path($src));
		if (@$this->modulePersistence[$realsrc] == true) {
			session_start();
			return @unserialize($_SESSION[$realsrc]);
		}
		return null;
	}

	public function setState($src, $state) {
		$realsrc = realpath('./' . $src);
		if (@$this->modulePersistence[$realsrc] == true) {
			$_SESSION[$realsrc] = serialize($state);
		}
	}

	public function serve() {
		$filename = $_SERVER['SCRIPT_NAME'];
		if (!$filename || $filename == '/') {
			$filename = 'index';
		}

		if (isset($this->internalResources[$filename])) {
			$this->setMimeType($filename);
			$data = file_get_contents(
				TG_ROOT . '/' . $this->internalResources[$filename]
			);
			if (!$data) {
				return $this->notFound();
			}
			return $this->outputStatic($data);
		}

		if (strpos($filename, '.') === false) {
			$extensions = array('php', 'md', 'html');
			foreach ($extensions as $ext) {
				$potential_name = "{$filename}.{$ext}";
				$disk_path = DOCROOT . '/' . $potential_name;
				if ($this->canServe($disk_path)) {
					return $this->execute($potential_name);
				}
			}
		}

		$disk_path = DOCROOT . $filename;
		if ($this->canServe($disk_path)) {
			return $this->execute($filename);
		}

		return $this->notFound();
	}

	public function block($path) {
		$this->blockedPaths[] = $path;
	}

	public function canServe($disk_path) {
		foreach ($this->blockedPaths as $p) {
			if (preg_match($p, $disk_path)) {
				error_log("blocked: {$disk_path}");
				return false;
			}
			if (!file_exists($disk_path)) {
				error_log("does not exist: {$disk_path}");
				return false;
			}
		}
		return true;
	}

	public function notFound() {
		http_response_code(404);
		foreach (['php', 'md', 'html'] as $ext) {
			if (file_exists(DOCROOT . "/404.{$ext}")) {
				$this->execute("404.{$ext}");
			}
		}
	}

}

$oldpath = get_include_path();
set_include_path(join(array(
	__DIR__,
	DOCROOT,
	PKGROOT,
	LIBDIR,
	TEMPLATE_DIR,
	TG_ROOT,
	TG_LIBDIR,
	$oldpath
), PATH_SEPARATOR));

$adapter = new HttpAdapter();
include_once('config.php');
require_once('serializer.php');
require_once('repository.php');
require_once('document.php');
require_once('session-handler.php');


$adapter->serve();

?>
