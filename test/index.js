(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

  /*
   * Add functions into an array.
   * These will be called in the RAF
   *
   * @param {function} cb function to call
   * @param {string} key key to reference the function (todo)
   */


  _createClass(Scroll, [{
    key: 'add',
    value: function add(cb, key) {
      this.queue.push(cb);
    }

    /* Tracks the event handlers attached via
     * this module
     */

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

    /* The nuts n' bolts. This is the RAF that
     * calls each function in the queue. Each function
     * is passed the current offset value and the last
     * recorded offset value (often the same depending)
     * on the speed of the scroll)
     */

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

      this.tickId = false;
      this.tick();
    }

    /* If the user hasn't scrolled in a while
     * we want to exit out of the RAF requence
     * and re-attach event bindings
     */

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

    /*
     * @static
     */

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

/*
 * This singleton pattern
 * allows us to unit test the module
 * by exposing all methods. The reset property
 * allows us to reset the state of the singleton
 * between tests.. May be useful outside of the 
 * testing context?
 *
 * @param {function} cb function to add to queue
 * @param {key} key key to reference the function in the queue
 * @param {bool} obj:base Return the base class or the singleton?
 * @param {bool} obj:reset Reset the singleton so that a new instance in created
 * @param {bool} obj:enable Enable the event handler and start the animation frame
 */


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

},{}],2:[function(require,module,exports){
'use strict';

var _index = require('./../src/index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _index2.default)(function (y1, y2) {
  return true;
});
(0, _index2.default)(function (y1, y2) {
  return true;
});
(0, _index2.default)(function (y1, y2) {
  return true;
});
(0, _index2.default)(function (y1, y2) {
  return true;
});
(0, _index2.default)(function (y1, y2) {
  return true;
});
(0, _index2.default)(function (y1, y2) {
  return console.log(y1 + ' ' + y2);
});
(0, _index2.default)(function (y1, y2) {
  return true;
});

},{"./../src/index.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvaW5kZXguanMiLCJ0ZXN0L2Rldi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7QUNBQSxJQUFJLGVBQWUsT0FBTyxxQkFBMUI7QUFDQSxJQUFJLGNBQWUsT0FBTyxvQkFBMUI7O0FBRUEsSUFBSSxrQkFBSjtBQUFBLElBQWUsaUJBQWY7QUFBQSxJQUF5QixtQkFBekI7QUFBQSxJQUFxQyxxQkFBckM7O0lBRU0sTTtBQUNKLG9CQUFhO0FBQUE7O0FBQUE7O0FBQ1gsU0FBSyxLQUFMLEdBQWEsRUFBYjtBQUNBLFNBQUssTUFBTCxHQUFjLEtBQWQ7QUFDQSxTQUFLLGFBQUwsR0FBcUIsS0FBckI7QUFDQSxTQUFLLEtBQUwsR0FBYSxDQUFDLENBQWQ7QUFDQSxTQUFLLE9BQUwsR0FBZSxJQUFmO0FBQ0EsU0FBSyxRQUFMLEdBQWdCLENBQWhCO0FBQ0EsU0FBSyxTQUFMLEdBQWlCLEtBQWpCOztBQUVBLGVBQVc7QUFBQSxhQUFNLE1BQUssUUFBTCxFQUFOO0FBQUEsS0FBWDtBQUNBLGlCQUFhO0FBQUEsYUFBTSxNQUFLLFVBQUwsRUFBTjtBQUFBLEtBQWI7QUFDQSxtQkFBZTtBQUFBLGFBQU0sTUFBSyxZQUFMLEVBQU47QUFBQSxLQUFmO0FBQ0Q7O0FBRUQ7Ozs7Ozs7Ozs7O3dCQU9JLEUsRUFBRyxHLEVBQUk7QUFDVCxXQUFLLEtBQUwsQ0FBVyxJQUFYLENBQWdCLEVBQWhCO0FBQ0Q7O0FBRUQ7Ozs7Ozs2QkFHUTtBQUNOLGFBQU8sZ0JBQVAsQ0FBd0IsUUFBeEIsRUFBa0MsUUFBbEM7QUFDQSxlQUFTLElBQVQsQ0FBYyxnQkFBZCxDQUErQixXQUEvQixFQUE0QyxRQUE1QztBQUNBLFdBQUssUUFBTDtBQUNEOzs7OEJBQ1E7QUFDUCxhQUFPLG1CQUFQLENBQTJCLFFBQTNCLEVBQXFDLFFBQXJDO0FBQ0EsZUFBUyxJQUFULENBQWMsbUJBQWQsQ0FBa0Ms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QjtBQUNELEM7Ozs7O0FDdkpEOzs7Ozs7QUFFQSxxQkFBUSxVQUFDLEVBQUQsRUFBSSxFQUFKO0FBQUEsU0FBVyxJQUFYO0FBQUEsQ0FBUjtBQUNBLHFCQUFRLFVBQUMsRUFBRCxFQUFJLEVBQUo7QUFBQSxTQUFXLElBQVg7QUFBQSxDQUFSO0FBQ0EscUJBQVEsVUFBQyxFQUFELEVBQUksRUFBSjtBQUFBLFNBQVcsSUFBWDtBQUFBLENBQVI7QUFDQSxxQkFBUSxVQUFDLEVBQUQsRUFBSSxFQUFKO0FBQUEsU0FBVyxJQUFYO0FBQUEsQ0FBUjtBQUNBLHFCQUFRLFVBQUMsRUFBRCxFQUFJLEVBQUo7QUFBQSxTQUFXLElBQVg7QUFBQSxDQUFSO0FBQ0EscUJBQVEsVUFBQyxFQUFELEVBQUksRUFBSjtBQUFBLFNBQVcsUUFBUSxHQUFSLENBQVksS0FBSyxHQUFMLEdBQVcsRUFBdkIsQ0FBWDtBQUFBLENBQVI7QUFDQSxxQkFBUSxVQUFDLEVBQUQsRUFBSSxFQUFKO0FBQUEsU0FBVyxJQUFYO0FBQUEsQ0FBUiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJsZXQgcmVxdWVzdEZyYW1lID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZVxubGV0IGNhbmNlbEZyYW1lICA9IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZVxuXG5sZXQgc2luZ2xldG9uLCBkZWJvdW5jZSwgZGV0ZWN0SWRsZSwgaGFuZGxlU2Nyb2xsXG5cbmNsYXNzIFNjcm9sbHtcbiAgY29uc3RydWN0b3IoKXtcbiAgICB0aGlzLnF1ZXVlID0gW11cbiAgICB0aGlzLnRpY2tJZCA9IGZhbHNlXG4gICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gZmFsc2VcbiAgICB0aGlzLnByZXZZID0gLTFcbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG4gICAgdGhpcy5oYW5kbGVycyA9IDBcbiAgICB0aGlzLmxhc3RFcnJvciA9IGZhbHNlXG5cbiAgICBkZWJvdW5jZSA9ICgpID0+IHRoaXMuZGVib3VuY2UoKVxuICAgIGRldGVjdElkbGUgPSAoKSA9PiB0aGlzLmRldGVjdElkbGUoKVxuICAgIGhhbmRsZVNjcm9sbCA9ICgpID0+IHRoaXMuaGFuZGxlU2Nyb2xsKClcbiAgfVxuXG4gIC8qXG4gICAqIEFkZCBmdW5jdGlvbnMgaW50byBhbiBhcnJheS5cbiAgICogVGhlc2Ugd2lsbCBiZSBjYWxsZWQgaW4gdGhlIFJBRlxuICAgKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYiBmdW5jdGlvbiB0byBjYWxsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkga2V5IHRvIHJlZmVyZW5jZSB0aGUgZnVuY3Rpb24gKHRvZG8pXG4gICAqL1xuICBhZGQoY2Isa2V5KXtcbiAgICB0aGlzLnF1ZXVlLnB1c2goY2IpXG4gIH1cblxuICAvKiBUcmFja3MgdGhlIGV2ZW50IGhhbmRsZXJzIGF0dGFjaGVkIHZpYVxuICAgKiB0aGlzIG1vZHVsZVxuICAgKi9cbiAgZW5hYmxlKCl7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIGRlYm91bmNlKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZGVib3VuY2UpXG4gICAgdGhpcy5oYW5kbGVycysrXG4gIH1cbiAgZGlzYWJsZSgpe1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBkZWJvdW5jZSlcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGRlYm91bmNlKVxuICAgIHRoaXMuaGFuZGxlcnMtLVxuICB9XG4gIGRlYm91bmNlKCl7XG4gICAgaWYgKHRoaXMudGlja0lkKXtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5oYW5kbGVycyA+IDApIHRoaXMuZGlzYWJsZSgpXG4gICAgICB0aGlzLnRpY2soKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cbiAgdGljaygpe1xuICAgIGlmICh0aGlzLnRpY2tJZCl7XG4gICAgICB0aGlzLmVycm9yKCdyZXF1ZXN0RnJhbWUgY2FsbGVkIHdoZW4gb25lIGV4aXN0cyBhbHJlYWR5JylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy50aWNrSWQgPSByZXF1ZXN0RnJhbWUoaGFuZGxlU2Nyb2xsKSB8fCB0cnVlXG4gICAgfVxuICB9XG5cbiAgLyogVGhlIG51dHMgbicgYm9sdHMuIFRoaXMgaXMgdGhlIFJBRiB0aGF0XG4gICAqIGNhbGxzIGVhY2ggZnVuY3Rpb24gaW4gdGhlIHF1ZXVlLiBFYWNoIGZ1bmN0aW9uXG4gICAqIGlzIHBhc3NlZCB0aGUgY3VycmVudCBvZmZzZXQgdmFsdWUgYW5kIHRoZSBsYXN0XG4gICAqIHJlY29yZGVkIG9mZnNldCB2YWx1ZSAob2Z0ZW4gdGhlIHNhbWUgZGVwZW5kaW5nKVxuICAgKiBvbiB0aGUgc3BlZWQgb2YgdGhlIHNjcm9sbClcbiAgICovXG4gIGhhbmRsZVNjcm9sbCgpe1xuICAgIGxldCB5ID0gd2luZG93LnBhZ2VZT2Zmc2V0XG4gICAgdGhpcy5xdWV1ZS5mb3JFYWNoKCBmbiA9PiBmbih5LCB0aGlzLnByZXZZKSApXG5cbiAgICB0aGlzLnNjcm9sbENoYW5nZWQgPSBmYWxzZVxuICAgIGlmICh0aGlzLnByZXZZICE9IHkpe1xuICAgICAgdGhpcy5zY3JvbGxDaGFuZ2VkID0gdHJ1ZVxuICAgICAgdGhpcy5wcmV2WSA9IHlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5zY3JvbGxDaGFuZ2VkKXtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpXG4gICAgICB0aGlzLnRpbWVvdXQgPSBudWxsXG4gICAgfSBlbHNlIGlmICghdGhpcy50aW1lb3V0KXtcbiAgICAgIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoZGV0ZWN0SWRsZSwgMjAwKVxuICAgIH1cblxuICAgIHRoaXMudGlja0lkID0gZmFsc2VcbiAgICB0aGlzLnRpY2soKVxuICB9XG5cbiAgLyogSWYgdGhlIHVzZXIgaGFzbid0IHNjcm9sbGVkIGluIGEgd2hpbGVcbiAgICogd2Ugd2FudCB0byBleGl0IG91dCBvZiB0aGUgUkFGIHJlcXVlbmNlXG4gICAqIGFuZCByZS1hdHRhY2ggZXZlbnQgYmluZGluZ3NcbiAgICovXG4gIGRldGVjdElkbGUoKXtcbiAgICBjYW5jZWxGcmFtZSh0aGlzLnRpY2tJZClcbiAgICB0aGlzLnRpY2tJZCA9IG51bGxcbiAgICB0aGlzLmVuYWJsZSgpXG4gIH1cbiAgZXJyb3IobXNnKXtcbiAgICB0aGlzLmxhc3RFcnJvciA9IG1zZ1xuICAgIGNvbnNvbGUud2Fybihtc2cpXG4gIH1cblxuICAvKlxuICAgKiBAc3RhdGljXG4gICAqL1xuICBzdGF0aWMgaXNTdXBwb3J0ZWQoKXtcbiAgICBpZiAoIXJlcXVlc3RGcmFtZSkge1xuICAgICAgWydtcycsICdtb3onLCAnd2Via2l0JywgJ28nXS5ldmVyeShwcmVmaXggPT4ge1xuICAgICAgICByZXF1ZXN0RnJhbWUgPSB3aW5kb3dbcHJlZml4ICsgJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgICBjYW5jZWxGcmFtZSAgPSB3aW5kb3dbcHJlZml4ICsgJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ10gfHxcbiAgICAgICAgICAgICAgICAgICAgICAgd2luZG93W3ByZWZpeCArICdDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgICAgcmV0dXJuICFyZXF1ZXN0RnJhbWU7XG4gICAgICB9KVxuXG4gICAgfVxuICAgIHJldHVybiByZXF1ZXN0RnJhbWVcbiAgfVxufVxuXG4vKlxuICogVGhpcyBzaW5nbGV0b24gcGF0dGVyblxuICogYWxsb3dzIHVzIHRvIHVuaXQgdGVzdCB0aGUgbW9kdWxlXG4gKiBieSBleHBvc2luZyBhbGwgbWV0aG9kcy4gVGhlIHJlc2V0IHByb3BlcnR5XG4gKiBhbGxvd3MgdXMgdG8gcmVzZXQgdGhlIHN0YXRlIG9mIHRoZSBzaW5nbGV0b25cbiAqIGJldHdlZW4gdGVzdHMuLiBNYXkgYmUgdXNlZnVsIG91dHNpZGUgb2YgdGhlIFxuICogdGVzdGluZyBjb250ZXh0P1xuICpcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNiIGZ1bmN0aW9uIHRvIGFkZCB0byBxdWV1ZVxuICogQHBhcmFtIHtrZXl9IGtleSBrZXkgdG8gcmVmZXJlbmNlIHRoZSBmdW5jdGlvbiBpbiB0aGUgcXVldWVcbiAqIEBwYXJhbSB7Ym9vbH0gb2JqOmJhc2UgUmV0dXJuIHRoZSBiYXNlIGNsYXNzIG9yIHRoZSBzaW5nbGV0b24/XG4gKiBAcGFyYW0ge2Jvb2x9IG9iajpyZXNldCBSZXNldCB0aGUgc2luZ2xldG9uIHNvIHRoYXQgYSBuZXcgaW5zdGFuY2UgaW4gY3JlYXRlZFxuICogQHBhcmFtIHtib29sfSBvYmo6ZW5hYmxlIEVuYWJsZSB0aGUgZXZlbnQgaGFuZGxlciBhbmQgc3RhcnQgdGhlIGFuaW1hdGlvbiBmcmFtZVxuICovXG5leHBvcnQgZGVmYXVsdCAoY2I9ZmFsc2Usa2V5PWZhbHNlLHtiYXNlPWZhbHNlLHJlc2V0PWZhbHNlLGVuYWJsZT10cnVlfT17fSkgPT4geyBcbiAgaWYgKHJlc2V0KSBzaW5nbGV0b24gPSBudWxsXG5cbiAgaWYgKCAhU2Nyb2xsLmlzU3VwcG9ydGVkKCkgKXtcbiAgICBjb25zb2xlLndhcm4oJ1JlcXVlc3QgQW5pbWF0aW9uIEZyYW1lIG5vdCBzdXBwb3J0ZWQnKVxuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgaWYgKCFzaW5nbGV0b24pIHNpbmdsZXRvbiA9IG5ldyBTY3JvbGwoKVxuXG4gIGlmIChjYikgc2luZ2xldG9uLmFkZChjYixrZXkpXG5cbiAgaWYgKHNpbmdsZXRvbi5oYW5kbGVycyA8IDEgJiYgZW5hYmxlKXtcbiAgICBzaW5nbGV0b24uZGVib3VuY2UoKVxuICAgIHNpbmdsZXRvbi5lbmFibGUoKVxuICB9XG5cbiAgcmV0dXJuIGJhc2UgPyBTY3JvbGwgOiBzaW5nbGV0b25cbn1cbiIsImltcG9ydCBzY3JvbGwgZnJvbSAnLi8uLi9zcmMvaW5kZXguanMnXG5cbnNjcm9sbCggKHkxLHkyKSA9PiB0cnVlIClcbnNjcm9sbCggKHkxLHkyKSA9PiB0cnVlIClcbnNjcm9sbCggKHkxLHkyKSA9PiB0cnVlIClcbnNjcm9sbCggKHkxLHkyKSA9PiB0cnVlIClcbnNjcm9sbCggKHkxLHkyKSA9PiB0cnVlIClcbnNjcm9sbCggKHkxLHkyKSA9PiBjb25zb2xlLmxvZyh5MSArICcgJyArIHkyKSApXG5zY3JvbGwoICh5MSx5MikgPT4gdHJ1ZSApXG4iXX0=
