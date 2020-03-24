<?php


	//
	// basically just wrappers for APC functions.
	//


	function cache_fetch($key, &$success) {
		return apc_fetch($key, $success);
	} // cache_fetch()

	function cache_store($key, $value, $ttl) {
		return apc_store($key, $value, $ttl);
	} // cache_store()

	function cache_exists($key) {
		return apc_exists($key);
	} // cache_exists()

	function cache_delete($key) {
		return cache_delete($key);
	} // cache_delete()

	function cache_inc($key, $value) {
		return apc_inc($key, $value);
	} // cache_inc()

	function cache_dec($key, $value) {
		return apc_dec($key, $value);
	} // cache_dec()


?>
