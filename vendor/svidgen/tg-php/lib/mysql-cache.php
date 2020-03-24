<?php


	//
	// simulate a limited set of APC cache functions using MySQL MEMORY table.
	// intended for development environments where APC is not installed.
	// 
	// also could be used for testing shared memory cache models in lieu of
	// Redis or similar.
	//


	// local copy of cache.
	$cache_cache = false;


	//
	// conditionally prune that cache before we begin
	//
	if (rand() > 0.1) {
		cache_prune_cache();
	}


	function cache_fetch($key, &$success = false) {
		global $cache_cache;
		if (!isset($cache_cache[$key])) {
			$sanitized_key = sanitize($key);
			$query = "select value from cache_entries where cache_entry_key='{$sanitized_key}' and modified >= now() - interval ttl second";
			if ($result = my_query($query)) {
				if ($row = my_fetch_assoc($result)) {
					$cache_cache[$key] = unserialize($row['value']);
				}
			} else {
			}
		}

		if (isset($cache_cache[$key])) {
			$success = true;
			return $cache_cache[$key];
		} else {
			$success = false;
			return false;
		}
	} // cache_fetch()

	function cache_store($key, $value, $ttl = 3600) {
		global $cache_cache;
		$cache_cache[$key] = $value;
		$sanitized_key = sanitize($key);
		$sanitized_value = sanitize(serialize($value));
		$ttl = (int)$ttl;
		$query = "insert into cache_entries (cache_entry_key, value, ttl) values ('{$sanitized_key}', '{$sanitized_value}', '{$ttl}') on duplicate key update value='{$sanitized_value}', ttl='{$ttl}'";
		my_query($query);
	} // cache_store()

	function cache_exists($key) {
		if (cache_fetch($key)) {
			return true;
		} else {
			return false;
		}
	} // cache_exists()

	function cache_delete($key) {
		global $cache_cache;
		unset($cache_cache[$key]);
		$sanitized_key = sanitize($key);
		$query = "delete from cache_entries where cache_entry_key='{$sanitized_key}'";
		my_query($query);
	} // cache_delete()

	function cache_inc($key, $value = 1) {
		$sanitized_key = sanitize($key);
		$sanitized_value = (int)$value;
		my_query("begin transaction");
			$v = cache_fetch($key);
			$v += $value;
			cache_store($key, $v);
			$rv = cache_fetch($key);
		my_query("commit");
		return $rv;
	} // cache_inc()

	function cache_dec($key, $value = 1) {
		return cache_inc($key, $value * -1);
	} // cache_dec()


	//
	// helper function(s)
	//


	function cache_prune_cache() {
		my_query("delete from cache_entries where modified < now() - interval ttl second");
	} // cache_prune_cache()


?>
