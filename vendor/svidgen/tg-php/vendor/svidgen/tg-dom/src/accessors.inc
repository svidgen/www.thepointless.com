<?php
	$require_theme = 'js';
?>
Object.prototype._get = function(n) {
  // first, infinite recursion prevention
  this.__gotten = this.__gotten || {};
  if (this.__gotten[n]) {
    return this[n];  // even if it's undefined.
  } else {
    this.__gotten[n] = true;
  }

  // then, call getters
  var rv;
  if (this[n] == undefined) {
    if (this['get'] && typeof(this.get) == 'function') {
      rv = this.get(n);
    } else {
      rv = undefined;
    }
  } else {
    if (this[n]['get'] && typeof(this[n].get) == 'function') {
      rv = this[n].get(n);
    } else {
      rv = this[n];
    }
  }

  // unset the "gotten" flag so the getter works properly in
  // subsequent calls
  this.__gotten[n];
  return rv;
}

Object.prototype._set = function(n, v) {
  // first, infinite recursion prevention
  this.__setted = this.__setted || {};
  if (this.__setted[n]) {
    return (this[n] = v);  // even if it's undefined.
  } else {
    this.__setted[n] = true;
  }

  // then, call getters
  var rv;
  if (this[n] == undefined) {
    if (this['set'] && typeof(this.set) == 'function') {
      rv = this.set(n, v);
    } else {
      rv = undefined;
    }
  } else {
    if (this[n]['set'] && typeof(this[n].set) == 'function') {
      rv = this[n].set(n, v);
    } else {
      rv = (this[n] = v);
    }
  }

  // unset the "gotten" flag so the getter works properly in
  // subsequent calls
  this.__setted[n];
  return rv;
}


var F = function(f) {

  var _f = f.toString();
  _f = _f.replace(/\.([a-zA-Z0-9_])+\s*=\s*([^=].*)\s*;/gm, "._set('$1',$2);");
  _f = _f.replace(/\[(['"a-zA-Z0-9_]+)\]\s*=\s*([^=].*)\s*;/gm, "._set($1, $2);");
  _f = _f.replace(/\.([a-zA-Z0-9_])+(\.|\s|;|\n|\))/g, "._get('$1')$2");
  _f = _f.replace(/\[(['"a-zA-Z0-9_]+)\]/g, "._get($1)");

  eval("var rv = " + _f + "");
  rv._original = f; // for debugging, curiosity, etc.
  return rv;

} // F()

