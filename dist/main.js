(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var requestFrame = window.requestAnimationFrame;
var cancelFrame = window.cancelAnimationFrame;
var scrollChanged = void 0,
    y = void 0,
    prevY = -1,
    idle = true,
    queue = [],
    timeout = void 0,
    tickId = void 0,
    init = false;

if (!requestFrame) {
  ['ms', 'moz', 'webkit', 'o'].every(function (prefix) {
    requestFrame = window[prefix + 'RequestAnimationFrame'];
    cancelFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
    return !requestFrame;
  });
}

var isSupported = !!requestFrame;

var enable = function enable() {
  window.addEventListener('scroll', debounce);
  document.body.addEventListener('touchmove', debounce);
};

var disable = function disable() {
  window.removeEventListener('scroll', debounce);
  document.body.removeEventListener('touchmove', debounce);
};

var debounce = function debounce() {
  if (!tickId) {
    disable();
    tick();
  }
};

var tick = function tick() {
  tickId = requestFrame(handleScroll);
};

var handleScroll = function handleScroll() {
  y = window.pageYOffset;
  queue.forEach(function (fn) {
    return fn(y, prevY);
  });

  scrollChanged = false;
  if (prevY != y) {
    scrollChanged = true;
    prevY = y;
  }

  if (scrollChanged) {
    clearTimeout(timeout);
    timeout = null;
  } else if (!timeout) {
    timeout = setTimeout(detectIdle, 200);
  }

  tick();
};

var detectIdle = function detectIdle() {
  cancelFrame(tickId);
  tickId = null;
  enable();
};

exports.default = function (cb) {
  if (isSupported) {
    queue.push(cb);
    if (!init) {
      init = true;
      debounce();
      enable();
    }
  } else {
    console.warn('Request Animation Frame not supported');
  }
};

},{}]},{},[1]);
