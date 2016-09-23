(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}(g.srcindex || (g.srcindex = {})).js = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var requestFrame = window.requestAnimationFrame;
var cancelFrame = window.cancelAnimationFrame;

var singleton = void 0,
    debounce = void 0,
    detectIdle = void 0,
    handleScroll = void 0;

var Scroll = function () {
  function Scroll() {
    var _this = this;

    _classCallCheck(this, Scroll);

    this.queue = [];
    this.tickId = false;
    this.scrollChanged = false;
    this.prevY = -1;
    this.timeout = null;
    this.handlers = 0;
    this.lastError = false;

    debounce = function debounce() {
      return _this.debounce();
    };
    detectIdle = function detectIdle() {
      return _this.detectIdle();
    };
    handleScroll = function handleScroll() {
      return _this.handleScroll();
    };
  }

  _createClass(Scroll, [{
    key: 'add',
    value: function add(cb, key) {
      this.queue.push(cb);
    }
  }, {
    key: 'enable',
    value: function enable() {
      window.addEventListener('scroll', debounce);
      document.body.addEventListener('touchmove', debounce);
      this.handlers++;
    }
  }, {
    key: 'disable',
    value: function disable() {
      window.removeEventListener('scroll', debounce);
      document.body.removeEventListener('touchmove', debounce);
      this.handlers--;
    }
  }, {
    key: 'debounce',
    value: function debounce() {
      if (this.tickId) {
        return false;
      } else {
        if (this.handlers > 0) this.disable();
        this.tick();
        return true;
      }
    }
  }, {
    key: 'tick',
    value: function tick() {
      if (this.tickId) {
        this.error('requestFrame called when one exists already');
      } else {
        this.tickId = requestFrame(handleScroll) || true;
      }
    }
  }, {
    key: 'handleScroll',
    value: function handleScroll() {
      var _this2 = this;

      var y = window.pageYOffset;
      this.queue.forEach(function (fn) {
        return fn(y, _this2.prevY);
      });

      this.scrollChanged = false;
      if (this.prevY != y) {
        this.scrollChanged = true;
        this.prevY = y;
      }

      if (this.scrollChanged) {
        clearTimeout(this.timeout);
        this.timeout = null;
      } else if (!this.timeout) {
        this.timeout = setTimeout(detectIdle, 200);
      }

      this.tick();
    }
  }, {
    key: 'detectIdle',
    value: function detectIdle() {
      cancelFrame(this.tickId);
      this.tickId = null;
      this.enable();
    }
  }, {
    key: 'error',
    value: function error(msg) {
      this.lastError = msg;
      console.warn(msg);
    }
  }], [{
    key: 'isSupported',
    value: function isSupported() {
      if (!requestFrame) {
        ['ms', 'moz', 'webkit', 'o'].every(function (prefix) {
          requestFrame = window[prefix + 'RequestAnimationFrame'];
          cancelFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
          return !requestFrame;
        });
      }
      return requestFrame;
    }
  }]);

  return Scroll;
}();

exports.default = function () {
  var cb = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
  var key = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

  var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref$base = _ref.base;
  var base = _ref$base === undefined ? false : _ref$base;
  var _ref$reset = _ref.reset;
  var reset = _ref$reset === undefined ? false : _ref$reset;
  var _ref$enable = _ref.enable;
  var enable = _ref$enable === undefined ? true : _ref$enable;

  if (reset) singleton = null;

  if (!Scroll.isSupported()) {
    console.warn('Request Animation Frame not supported');
    return false;
  }

  if (!singleton) singleton = new Scroll();

  if (cb) singleton.add(cb, key);

  if (singleton.handlers < 1 && enable) {
    singleton.debounce();
    singleton.enable();
  }

  return base ? Scroll : singleton;
};

},{}]},{},[1])(1)
});