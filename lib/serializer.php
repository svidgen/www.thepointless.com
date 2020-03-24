<?php

namespace TG;

require_once('util.php');
require_once('tg-api.php');


class Serializer {

	public function getSerializer() {
		$serializer = null;
		if (isset($_GET['format'])) {
			if ($_GET['format'] == 'jsonp') {
				$serializer = new \TG\JsonpSerializer();
			}
		}
		if ($serializer == null) {
			$serializer = new \TG\HtmlSerializer();
		}
		return $serializer;
	}

	public function serialize($o) {
		$serializer = $this->getSerializer();
		return $serializer->serialize($o);
	}

} // Serializer


class HtmlSerializer {

	public $namespaceDelimiter = ':';

	public function serialize($o, $maxDepth = null) {
		if ($maxDepth === null) {
			$maxDepth = 128;

			$version = code_version();

			$page_url = $_SERVER['PHP_SELF'];
			if (preg_match("/\/$/", $page_url)) {
				$page_url .= "index.php";
			}

			$css = '';
			$css_src = preg_replace("/\.[a-zA-Z0-9]+$/", '.css', $page_url);
			if (file_exists('./' . $css_src)) {
				$css = "<style>@import '{$css_src}?v={$version}';</style>\n";
			}

			$js = '';
			$js_src  = preg_replace("/\.[a-zA-Z0-9]+$/", '.js', $page_url);
			if (file_exists('./' . $js_src)) {
				$js = "<script src='{$js_src}?v={$version}'></script>\n";
			}

			$outputPrefix = "<!doctype html>\n<html><head>\n"
				. "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
				. $css
				. "</head><body>\n"
			;

			$outputSuffix = "\n"
				. "<script src='/tg-js/tg-all.js?v={$version}'></script>\n"
				. $js
				. "</body></html>"
			;
		} else {
			$outputPrefix = "";
			$outputSuffix = "";
		}

		if ($maxDepth <= 0) {
			return;
		}

		if (!is_object($o) && !is_array($o)) {
			return $outputPrefix . htmlsafe($o) . $outputSuffix;
		}

		$classname = gettype($o);
		$methods = array();

		if ($classname == 'object') {
			$classname = get_class($o);
			$methods = get_class_methods($o);
		}

		if ($classname == 'array') {
			$classname = 'div';
		}

		$classname = htmlsafe($classname);
		$classname = strtolower(preg_replace(
			"/\\\\/",
			$this->namespaceDelimiter,
			$classname
		));

		$attributes = array();
		$children = array();

		foreach ($o as $k => $v) {
			$property = htmlsafe($k);

			if (is_object($v)) {
				$v->{'data-id'} = $property;
				$children[] = $this->serialize($v, $maxDepth - 1);
			} else if (is_array($v)) {
				$v['data-id'] = $property;
				$children[] = $this->serialize($v, $maxDepth - 1);
			} else if (is_numeric($k)) {
				$children[] = $this->serialize($v, $maxDepth - 1);
			} else if (is_bool($v)) {
				$attributes[] = htmlsafe($property)
					. "=\"" . ($v ? 'true' : 'false') . "\""
				;
			} else {
				$attributes[] = htmlsafe($property)
					. "=\"" . htmlsafe($v) . "\""
				;
			}
		}

		$attributes_html = join(" ", $attributes);
		$children_html = join("\n", $children);

		return "{$outputPrefix}<{$classname} {$attributes_html}>{$children_html}</{$classname}>{$outputSuffix}";
	}

} // HtmlSerializer


class JsonpSerializer {

	private function getFunctionWrappers($o) {
		$wrappers = array();
		$method_names = get_class_methods($o);
		foreach ($method_names as $method_name) {
			$wrappers[$method_name] = function() use ($o, $method_name) {
				return call_user_func_array(
					array($o, $method_name),
					func_get_args()
				);
			};
		}
		return $wrappers;
	}

	public function serialize($o, $endpoint = null) {
		ob_start();
		$functions = $this->getFunctionWrappers($o);
		$endpoint = $endpoint ? $endpoint : $_SERVER['REQUEST_URI'];
		tg_api_start(
			preg_replace("/\\\\/", '.', get_class($o)),
			$functions,
			null,		// pollable (bool)
			null,		// debug mode (bool)
			$endpoint	// endpoint (str)
		);
		$api = ob_get_contents();
		ob_end_clean();
		return $api;
	}

} // JsonpSerializer


class APIIncludeSerializer {
	public function serialize($o, $adapter) {
		$classinfo = new \ReflectionClass(get_class($o));
		$endpoint = $adapter->URI($classinfo->getFileName()) . '?format=jsonp';
		$apiname = preg_replace("/\\\\/", '.', get_class($o));
		$jsonp_serializer = new JsonpSerializer();
		$api = $jsonp_serializer->serialize($o, $endpoint);
		$api .= "module.exports = {$apiname};\n";
		return $api;
	}
} // APIIncludeSerializer

?>
