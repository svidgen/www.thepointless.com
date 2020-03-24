<?php

namespace TG;

trait Initializable {

	public function initialize($values = array(), $dynamic = true) {
		global $adapter;
		$values = (object)$values;
		$adapter->log(
			'tracing',
			"initializing " . get_class($this)
				. " as " . ($dynamic ? "dynamic" : "static")
		);
		foreach ($values as $k => $v) {
			$this->setProperty($k, $v, $dynamic);
		}
	}

	public function setProperty($key, $value, $dynamic = true) {
		global $adapter;
		if ($dynamic) {
			$this->{$key} = $value;
			return;
		}

		if (!property_exists($this, $key)) {
			return;
		}

		// TODO: expand this out to check for numeric types (or convertability)
		if (is_scalar($this->{$key})) {
			if (is_scalar($value)) {
				$this->{$key} = $value;
			}
			return;
		}

		if ($this->{$key} instanceof ArrayObject) {
			if (is_array($value)) {
				// permits overloaded, validated, or "typed" collections
				// see http://stackoverflow.com/questions/20763744/type-hinting-specify-an-array-of-objects
				foreach ($value as $k => $v) {
					$this->{$key}[$k] = $v;
				}
			}

			return;
		}

		if (method_exists($this->{$key}, 'initialize')) {
			$this->{$key}->initialize($value);
			return;
		}

		// how should we initialize object without initialize?
		// for now ... I guess we'll just set it.
		$this->{$key} = $value;
	}

}

?>
