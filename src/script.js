(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _opzjs = _interopRequireDefault(require("opzjs"));

var _tetris = _interopRequireDefault(require("./tetris/tetris"));

var _midi = _interopRequireDefault(require("./midi"));

var _render = require("./render");

var _listen;

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var tetrisWidth = 10;
var tetrisHeight = 20;
var tetrisBaseClock = 750;
var tetrisLevelUpRate = 0.15;
var tetrisLevelUpCap = 5;
var keyThrottle = 50;
var midiThrottle = 125;
var pixelSize = 0;
var fps = 20;
var t = new _tetris.default(tetrisWidth, tetrisHeight, tetrisBaseClock, tetrisLevelUpCap, tetrisLevelUpRate);
var canvas = document.getElementById("tetris");
var ctx = canvas.getContext("2d");
var midi = new _midi.default();
/*
 Web Midi API is NOT supported by a few common browers
 */

if (!midi.supported) {
  var unsupported = document.getElementById("unsupported").getAttribute("data-tab");
  var setupBtn = document.getElementById("midi-setup");
  setupBtn.setAttribute('data-target', unsupported);
} // Keep track of which keys are pressed


var midiDirections = {};
var opzSettings = {
  "listen": (_listen = {
    "kick": true,
    "snare": true,
    "perc": true,
    "sample": true,
    "bass": true,
    "lead": true,
    "arp": true,
    "chord": true,
    "fx1": true,
    "fx2": true,
    "tape": true,
    "master": true,
    "perform": true
  }, (0, _defineProperty2.default)(_listen, "perform", true), (0, _defineProperty2.default)(_listen, "module", true), (0, _defineProperty2.default)(_listen, "lights", true), (0, _defineProperty2.default)(_listen, "motion", true), _listen)
};
/*
  Setup canvas size based on window height.
*/

var setupCanvas = function setupCanvas(canvas, width, height, containerId) {
  var windowHeight = Math.floor(window.innerHeight * 0.75);
  document.getElementById(containerId).style.height = "".concat(window.innerHeight * 0.78, "px");
  pixelSize = Math.floor(windowHeight / height);
  canvas.width = width * pixelSize;
  canvas.height = height * pixelSize;
  var control = document.getElementById("controls").getElementsByTagName("img")[0];
  control.style.height = "".concat(window.innerHeight * 0.20, "px");
}; // Rendering loop


setInterval(function () {
  (0, _render.render)(ctx, t, pixelSize);
  (0, _render.update)("score", t.score);
  (0, _render.update)("level", t.level());
}, fps);
/*
  Game clock
*/

var clock = function clock() {
  t.next();
  if (t.gameOver) (0, _render.showGameButtons)();
  setTimeout(clock, t.clock());
};

setupCanvas(canvas, t.width, t.height, "game");
clock(); // Reset game

var reset = function reset() {
  (0, _render.hideGameButtons)();
  t.reset();
};

document.getElementById("restart").addEventListener("click", function (e) {
  reset();
  e.target.innerHTML = "Try again?";
}); // Throttle Input
// Credit: https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44

var throttle = function throttle(delay, fn) {
  var lastCall = 0;
  return function () {
    var now = new Date().getTime();

    if (now - lastCall < delay) {
      return;
    }

    lastCall = now;
    return fn.apply(void 0, arguments);
  };
}; // Keyboard Events


var checkKey = function checkKey(e) {
  e = e || window.event;

  if (e.keyCode == '38') {
    // up arrow
    t.rotate("cw");
  } else if (e.keyCode == '40') {
    // down arrow
    t.move("down");
  } else if (e.keyCode == '37') {
    // left arrow
    t.move("left");
  } else if (e.keyCode == '39') {
    // right arrow
    t.move("right");
  }
};

document.onkeydown = throttle(keyThrottle, checkKey);
/*
  Handle OP-Z Midi Input
*/

var opzMidiHandler = function opzMidiHandler(event) {
  var data = _opzjs.default.decode(event.data);

  if (!opzSettings["listen"][data.track]) return;

  if (data.action === "keys") {
    var action = null;

    switch (data.value.note) {
      case "F":
        action = "left";
        break;

      case "G":
        action = "down";
        break;

      case "A":
        action = "right";
        break;

      case "D":
        if (data.velocity > 0) t.rotate("ccw");
        break;

      case "E":
        if (data.velocity > 0) t.rotate("cw");
        break;

      case "C#":
        if (t.gameOver) reset();
        break;
    }

    if (action) processAction(action, data.velocity);
  }
};
/*
  Handle Generic Midi Input
*/


var midiHandler = function midiHandler(event) {
  var data = event.data;
  if (data.length < 3) return;
  console.log(data);
  var key = data[1] % 12;
  var velocity = data[2];
  var action = null;

  switch (key) {
    case 5:
      // F
      action = "left";
      break;

    case 7:
      // G
      action = "down";
      break;

    case 9:
      // A
      action = "right";
      break;

    case 2:
      // D
      if (velocity > 0) t.rotate("ccw");
      break;

    case 4:
      // E
      if (velocity > 0) t.rotate("cw");
      break;

    case 1:
      // C#
      if (t.gameOver) reset();
      break;
  }

  if (action) processAction(action, velocity);
};
/*
  Processes left, right, up, down

  Uses setInterval to simulate holding a key
*/


var processAction = function processAction(action, velocity) {
  if (velocity > 0) {
    midiDirections[action] = setInterval(function () {
      t.move(action);
    }, midiThrottle);
  } else {
    var interval = midiDirections[action];
    clearInterval(interval);
  }
};
/*
 Navigation Handling
*/


var main = document.getElementById("main");
var buttons = main.getElementsByTagName("button");
var tabs = main.getElementsByClassName("tab");

var _iterator = _createForOfIteratorHelper(buttons),
    _step;

try {
  var _loop2 = function _loop2() {
    var button = _step.value;
    var target = button.getAttribute("data-target");

    if (target) {
      button.addEventListener('click', function (event) {
        if (event.target.id === "opz-midi-connect") {
          midiConnect(target, opzMidiHandler);
          opzSettingsSetup(opzSettings);
        } else if (event.target.id === "midi-connect") {
          midiConnect(target, midiHandler);
        } else {
          tabSwitch(target);
        }
      });
    }
  };

  for (_iterator.s(); !(_step = _iterator.n()).done;) {
    _loop2();
  }
} catch (err) {
  _iterator.e(err);
} finally {
  _iterator.f();
}

;
/*
  Switch between tabs
 */

var tabSwitch = function tabSwitch(target) {
  var _iterator2 = _createForOfIteratorHelper(tabs),
      _step2;

  try {
    for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
      var tab = _step2.value;
      var tabId = tab.getAttribute("data-tab");

      if (tabId === target) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    }
  } catch (err) {
    _iterator2.e(err);
  } finally {
    _iterator2.f();
  }
};
/*
  List midi-devices with click handler
*/


var midiConnect = function midiConnect(target, handler) {
  midi.setup();
  setTimeout(function () {
    if (midi.devices.length > 0) {
      var list = document.getElementById("devices");
      var item = document.createElement('li');

      for (var i = 0; i < midi.devices.length; i++) {
        item.innerHTML = midi.devices[i].name;
        item.setAttribute('data-device', i);
        item.setAttribute('data-target', "5");
        item.addEventListener('click', function (event) {
          var deviceId = parseInt(event.target.getAttribute("data-device"));
          var targetId = event.target.getAttribute("data-target");
          midi.selectDevice(deviceId, handler);
          tabSwitch(targetId);
        });
        list.appendChild(item);
      }

      tabSwitch(target);
    } else {
      (0, _render.update)("opz-midi-error", "Couldn't find any devices.");
      (0, _render.update)("midi-error", "Couldn't find any devices.");
    }
  }, 250);
};
/*
  Setup OP-Z Settings menu
*/


var opzSettingsSetup = function opzSettingsSetup(settings) {
  var settingsElement = document.getElementById("opz-settings");

  var _loop = function _loop() {
    var track = _Object$keys[_i];
    var tracks = document.getElementById("tracks");
    var item = document.createElement('li');
    item.setAttribute('data-track', track);
    (0, _render.toggle)(item, "active");
    var box = document.createElement('div');
    (0, _render.toggle)(box, "box");
    var title = document.createElement('span');
    title.innerHTML = track;
    item.appendChild(box);
    item.appendChild(title);
    item.addEventListener("click", function (event) {
      var target = event.target;
      if (target != item) target = target.parentNode;
      var track = target.getAttribute("data-track");
      (0, _render.toggle)(target, "active");
      settings["listen"][track] = !settings["listen"][track];
    });
    tracks.appendChild(item);
  };

  for (var _i = 0, _Object$keys = Object.keys(settings["listen"]); _i < _Object$keys.length; _i++) {
    _loop();
  }

  ;
  (0, _render.toggle)(settingsElement, "active");
  document.getElementById("opz-settings-toggle").addEventListener("click", function (event) {
    var s = document.getElementById("opz-settings-settings");
    (0, _render.toggle)(s, "active");
  });
};

},{"./midi":2,"./render":3,"./tetris/tetris":8,"@babel/runtime/helpers/defineProperty":15,"@babel/runtime/helpers/interopRequireDefault":16,"opzjs":26}],2:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

function _createForOfIteratorHelper(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = o[Symbol.iterator](); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var Midi = /*#__PURE__*/function () {
  function Midi() {
    (0, _classCallCheck2.default)(this, Midi);
    this.self = this;
    this.devices = [];
    this.supported = this.checkMidiSupport();
  }

  (0, _createClass2.default)(Midi, [{
    key: "setup",
    value: function setup() {
      navigator.requestMIDIAccess().then(this.onMIDISuccess.bind(this), this.onMIDIFailure.bind(this));
    }
  }, {
    key: "onMIDISuccess",
    value: function onMIDISuccess(midiAccess) {
      var inputs = midiAccess.inputs.values();

      var _iterator = _createForOfIteratorHelper(midiAccess.inputs.values()),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var input = _step.value;
          this.devices.push(input);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "onMIDIFailure",
    value: function onMIDIFailure() {
      console.log('Could not access your MIDI devices.');
    }
  }, {
    key: "checkMidiSupport",
    value: function checkMidiSupport() {
      if (navigator.requestMIDIAccess) {
        console.log('This browser supports WebMIDI!');
        return true;
      } else {
        console.log('WebMIDI is not supported in this browser.');
        return false;
      }
    }
  }, {
    key: "selectDevice",
    value: function selectDevice(deviceIndex, hander) {
      var device = this.devices[deviceIndex];
      device.onmidimessage = hander;
      console.log("Connected to \"".concat(device.name, "\""));
    }
  }]);
  return Midi;
}();

var _default = Midi;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":16}],3:[function(require,module,exports){
"use strict";

// Handles Rendering of the board onto a canvas
var render = function render(canvasCtx, tetris) {
  var pixelSize = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
  var frame = tetris.getFrame();

  for (var y = 0; y < frame.h; y++) {
    for (var x = 0; x < frame.w; x++) {
      canvasCtx.fillStyle = frame.grid[y][x].color;
      canvasCtx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
};

var update = function update(id, value) {
  document.getElementById(id).innerHTML = value;
};

var toggle = function toggle(element, klass) {
  if (element.classList.contains(klass)) {
    element.classList.remove(klass);
  } else {
    element.classList.add(klass);
  }
};

var showGameButtons = function showGameButtons() {
  document.getElementById("game-buttons").classList.add("active");
};

var hideGameButtons = function hideGameButtons() {
  document.getElementById("game-buttons").classList.remove("active");
};

module.exports = {
  render: render,
  update: update,
  toggle: toggle,
  showGameButtons: showGameButtons,
  hideGameButtons: hideGameButtons
};

},{}],4:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _point = _interopRequireDefault(require("./point"));

var Board = /*#__PURE__*/function () {
  function Board(w, h) {
    var grid = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    (0, _classCallCheck2.default)(this, Board);
    this.w = w;
    this.h = h;
    this.grid = grid || this.blankGrid();
  }

  (0, _createClass2.default)(Board, [{
    key: "blankGrid",
    value: function blankGrid() {
      var grid = [];

      for (var y = 0; y < this.h; y++) {
        grid.push(this.newRow());
      }

      return grid;
    }
  }, {
    key: "newRow",
    value: function newRow() {
      return new Array(this.w).fill(new _point.default(0));
    }
  }, {
    key: "removeRow",
    value: function removeRow(y) {
      this.grid.splice(y, 1);
      this.grid.unshift(this.newRow());
    } // Sets value, but ignores if out of bounds

  }, {
    key: "set",
    value: function set(x, y, value) {
      if (this.withinBounds(x, y)) {
        this.grid[y][x] = value;
      }
    }
  }, {
    key: "dupe",
    value: function dupe() {
      var grid = [];

      for (var y = 0; y < this.h; y++) {
        var row = [];

        for (var x = 0; x < this.w; x++) {
          row.push(this.grid[y][x]);
        }

        grid.push(row);
      }

      return [this.w, this.h, grid];
    }
  }, {
    key: "withinBounds",
    value: function withinBounds(x, y) {
      return x >= 0 && x < this.w && y >= 0 && y < this.h;
    }
  }]);
  return Board;
}();

var _default = Board;
exports.default = _default;

},{"./point":7,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":16}],5:[function(require,module,exports){
"use strict";

var COLOURS = ['#CA281D', // Red
'#F4AE01', // Yellow
'#0071BB', // Blue
'#11A159', // Green
'#F56C46', // Orange
'#008080', // Teal/Turq
'#5BB5F2', // Light Blue
'#7832B4' // Purple
];

var randomColour = function randomColour() {
  var index = math.floor(math.random() * COLOURS.length);
  return COLOURS[index];
};

var selectColour = function selectColour(index) {
  return COLOURS[index % COLOURS.length];
};

module.exports = {
  randomColour: randomColour,
  selectColour: selectColour
};

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _colour = require("./colour");

var _point = _interopRequireDefault(require("./point"));

var SHAPES = [[[1, 0, 0], [1, 1, 1], [0, 0, 0]], [[0, 0, 1], [1, 1, 1], [0, 0, 0]], [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], [[1, 1], [1, 1]], [[1, 1, 0], [0, 1, 1], [0, 0, 0]], [[0, 1, 1], [1, 1, 0], [0, 0, 0]], [[0, 1, 0], [1, 1, 1], [0, 0, 0]]];

var Piece = /*#__PURE__*/function () {
  function Piece(x, y) {
    var shape = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    (0, _classCallCheck2.default)(this, Piece);
    this.x = x;
    this.y = y;
    this.shape = shape || this.initShape();
  }

  (0, _createClass2.default)(Piece, [{
    key: "initShape",
    value: function initShape() {
      var _this$randomShape = this.randomShape(),
          _this$randomShape2 = (0, _slicedToArray2.default)(_this$randomShape, 2),
          shape = _this$randomShape2[0],
          index = _this$randomShape2[1];

      var grid = [];

      for (var i = 0; i < shape.length; i++) {
        var row = [];

        for (var j = 0; j < shape[i].length; j++) {
          var colour = shape[i][j] && (0, _colour.selectColour)(index) || "white";
          row.push(new _point.default(shape[i][j], colour));
        }

        grid.push(row);
      }

      return grid;
    }
  }, {
    key: "dupe",
    value: function dupe() {
      return new Piece(this.x, this.y, this.shape);
    }
  }, {
    key: "move",
    value: function move(direction) {
      switch (direction) {
        case "down":
          this.y++;
          break;

        case "left":
          this.x--;
          break;

        case "right":
          this.x++;
          break;
      }
    }
  }, {
    key: "rotate",
    value: function rotate() {
      var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "cw";

      if (direction != "cw" && direction != "ccw") {
        return this;
      }

      for (var i = 0; i < this.shape.length; i++) {
        for (var j = 0; j < i; j++) {
          var _ref = [this.shape[j][i], this.shape[i][j]];
          this.shape[i][j] = _ref[0];
          this.shape[j][i] = _ref[1];
        }
      }

      switch (direction) {
        case "ccw":
          this.shape.map(function (row) {
            return row.reverse();
          });
          break;

        case "cw":
          this.shape.reverse();
          break;
      }

      return this;
    }
  }, {
    key: "empty",
    value: function empty(x, y) {
      return this.shape[y][x].empty();
    }
  }, {
    key: "width",
    value: function width() {
      if (this.shape.length == 0) return 0;
      return this.shape[0].length;
    }
  }, {
    key: "randomShape",
    value: function randomShape() {
      var index = Math.floor(Math.random() * SHAPES.length);
      return [SHAPES[index], index];
    }
  }]);
  return Piece;
}();

var _default = Piece;
exports.default = _default;

},{"./colour":5,"./point":7,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":16,"@babel/runtime/helpers/slicedToArray":23}],7:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var Point = /*#__PURE__*/function () {
  function Point() {
    var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '#1D1D1D';
    (0, _classCallCheck2.default)(this, Point);
    this.value = value;
    this.color = color;
  }

  (0, _createClass2.default)(Point, [{
    key: "empty",
    value: function empty() {
      return this.value == null || this.value == 0;
    }
  }]);
  return Point;
}();

var _default = Point;
exports.default = _default;

},{"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":16}],8:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _construct2 = _interopRequireDefault(require("@babel/runtime/helpers/construct"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _board = _interopRequireDefault(require("./board"));

var _piece = _interopRequireDefault(require("./piece"));

var Tetris = /*#__PURE__*/function () {
  function Tetris(width, height) {
    var baseClock = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 750;
    var levelUpCap = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 5;
    var levelUpRate = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0.25;
    (0, _classCallCheck2.default)(this, Tetris);
    this.baseClock = baseClock;
    this.levelUpCap = levelUpCap; // Level up every X points

    this.levelUpRate = levelUpRate; // Increase speed by YY%

    this.score = 0;
    this.width = width;
    this.height = height;
    this.board = this.newBoard();
    this.piece = null;
    this.gameOver = true;
  }

  (0, _createClass2.default)(Tetris, [{
    key: "reset",
    value: function reset() {
      this.board = this.newBoard();
      this.piece = this.newPiece();
      this.score = 0;
      this.gameOver = false;
    }
  }, {
    key: "level",
    value: function level() {
      return Math.ceil(this.score / this.levelUpCap) || 1;
    }
  }, {
    key: "clock",
    value: function clock() {
      var increase = Math.pow(1 + this.levelUpRate, this.level() - 1);
      return Math.ceil(this.baseClock / increase);
    }
  }, {
    key: "newPiece",
    value: function newPiece() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var piece = new _piece.default(x, y);
      piece.x = Math.floor(this.width / 2 - piece.width() / 2);
      return piece;
    }
  }, {
    key: "newBoard",
    value: function newBoard() {
      return new _board.default(this.width, this.height);
    } // Check if collision

  }, {
    key: "collision",
    value: function collision(piece) {
      var result = false;

      for (var dy = 0; dy < piece.shape.length; dy++) {
        if (result) break;

        for (var dx = 0; dx < piece.shape[dy].length; dx++) {
          if (piece.empty(dx, dy)) continue;
          var y = piece.y + dy;
          var x = piece.x + dx;

          if (!this.board.withinBounds(x, y)) {
            result = true;
            break;
          }

          if (!this.board.grid[y][x].empty()) {
            result = true;
            break;
          }
        }
      }

      return result;
    }
  }, {
    key: "next",
    value: function next() {
      if (this.gameOver) return;
      var pieceDup = this.piece.dupe();
      pieceDup.move("down");

      if (this.collision(pieceDup)) {
        this.freeze(this.piece);
        this.piece = this.newPiece();

        if (this.collision(this.piece)) {
          this.gameOver = true;
        }
      } else {
        this.piece.move("down");
      }

      this.checkCompleteRows();
    }
  }, {
    key: "checkCompleteRows",
    value: function checkCompleteRows() {
      for (var y = 0; y < this.board.h; y++) {
        var complete = true;

        for (var x = 0; x < this.board.w; x++) {
          if (this.board.grid[y][x].empty()) {
            complete = false;
            break;
          }
        }

        if (complete) {
          this.score++;
          this.board.removeRow(y);
        }
      }
    }
  }, {
    key: "freeze",
    value: function freeze(piece) {
      var shape = piece.shape;

      for (var dy = 0; dy < shape.length; dy++) {
        for (var dx = 0; dx < shape[dy].length; dx++) {
          if (!piece.empty(dx, dy)) {
            this.board.set(piece.x + dx, piece.y + dy, shape[dy][dx]);
          }
        }
      }
    }
  }, {
    key: "move",
    value: function move(direction) {
      if (this.gameOver) return;
      var pieceDup = this.piece.dupe();
      pieceDup.move(direction); // If "the next move is a collision"

      if (this.collision(pieceDup)) return;
      this.piece.move(direction);
    } // Rotate until no collision

  }, {
    key: "rotate",
    value: function rotate(direction) {
      for (var i = 0; i < 4; i++) {
        this.piece.rotate(direction);

        if (!this.collision(this.piece)) {
          break;
        }
      }
    }
  }, {
    key: "getFrame",
    value: function getFrame() {
      var board = (0, _construct2.default)(_board.default, (0, _toConsumableArray2.default)(this.board.dupe()));
      if (!this.piece) return board;
      var shape = this.piece.shape;
      if (!shape) return board;

      for (var dy = 0; dy < shape.length; dy++) {
        for (var dx = 0; dx < shape[dy].length; dx++) {
          if (!this.piece.empty(dx, dy)) {
            board.set(this.piece.x + dx, this.piece.y + dy, shape[dy][dx]);
          }
        }
      }

      return board;
    }
  }, {
    key: "withinBounds",
    value: function withinBounds(piece) {
      var within = true;

      loop: for (var dy = 0; dy < piece.shape.length; dy++) {
        for (var dx = 0; dx < piece.shape[p_y].length; dx++) {
          var x = piece.x + dx;
          var y = piece.y + dy;

          if (!(piece.empty(dx, dy) && this.board.withinBounds(x, y))) {
            within = false;
            break loop;
          }
        }
      }

      return piece;
    }
  }]);
  return Tetris;
}();

var _default = Tetris;
exports.default = _default;

},{"./board":4,"./piece":6,"@babel/runtime/helpers/classCallCheck":12,"@babel/runtime/helpers/construct":13,"@babel/runtime/helpers/createClass":14,"@babel/runtime/helpers/interopRequireDefault":16,"@babel/runtime/helpers/toConsumableArray":24}],9:[function(require,module,exports){
"use strict";

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }

  return arr2;
}

module.exports = _arrayLikeToArray;

},{}],10:[function(require,module,exports){
"use strict";

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

module.exports = _arrayWithHoles;

},{}],11:[function(require,module,exports){
"use strict";

var arrayLikeToArray = require("./arrayLikeToArray");

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return arrayLikeToArray(arr);
}

module.exports = _arrayWithoutHoles;

},{"./arrayLikeToArray":9}],12:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;

},{}],13:[function(require,module,exports){
"use strict";

var setPrototypeOf = require("./setPrototypeOf");

var isNativeReflectConstruct = require("./isNativeReflectConstruct");

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    module.exports = _construct = Reflect.construct;
  } else {
    module.exports = _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

module.exports = _construct;

},{"./isNativeReflectConstruct":17,"./setPrototypeOf":22}],14:[function(require,module,exports){
"use strict";

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;

},{}],15:[function(require,module,exports){
"use strict";

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;

},{}],16:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

},{}],17:[function(require,module,exports){
"use strict";

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

module.exports = _isNativeReflectConstruct;

},{}],18:[function(require,module,exports){
"use strict";

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

module.exports = _iterableToArray;

},{}],19:[function(require,module,exports){
"use strict";

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

module.exports = _iterableToArrayLimit;

},{}],20:[function(require,module,exports){
"use strict";

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableRest;

},{}],21:[function(require,module,exports){
"use strict";

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

module.exports = _nonIterableSpread;

},{}],22:[function(require,module,exports){
"use strict";

function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;

},{}],23:[function(require,module,exports){
"use strict";

var arrayWithHoles = require("./arrayWithHoles");

var iterableToArrayLimit = require("./iterableToArrayLimit");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableRest = require("./nonIterableRest");

function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}

module.exports = _slicedToArray;

},{"./arrayWithHoles":10,"./iterableToArrayLimit":19,"./nonIterableRest":20,"./unsupportedIterableToArray":25}],24:[function(require,module,exports){
"use strict";

var arrayWithoutHoles = require("./arrayWithoutHoles");

var iterableToArray = require("./iterableToArray");

var unsupportedIterableToArray = require("./unsupportedIterableToArray");

var nonIterableSpread = require("./nonIterableSpread");

function _toConsumableArray(arr) {
  return arrayWithoutHoles(arr) || iterableToArray(arr) || unsupportedIterableToArray(arr) || nonIterableSpread();
}

module.exports = _toConsumableArray;

},{"./arrayWithoutHoles":11,"./iterableToArray":18,"./nonIterableSpread":21,"./unsupportedIterableToArray":25}],25:[function(require,module,exports){
"use strict";

var arrayLikeToArray = require("./arrayLikeToArray");

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}

module.exports = _unsupportedIterableToArray;

},{"./arrayLikeToArray":9}],26:[function(require,module,exports){
"use strict";

var _MIDI = require('./opz.json');

var error = function error(value) {
  console.log('[OPZ]: Untracked midi value. Please create an issue https://github.com/nbw/opz/issues');
  console.log("[OPZ]: ".concat(value));
  return value;
};

var get = function get() {
  var value = _MIDI;

  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  for (var i = 0; i < args.length; i++) {
    value = value[args[i]];
    if (!value) throw 'Untracked value';
  }

  return value;
};

var track = function track(input) {
  if (input.length < 1) return null;
  return get('track', input[0]);
};

var action = function action(input) {
  if (input.length < 1) return null;
  return get('action', input[0]);
};

var note = function note(input) {
  if (input.length < 2) return null;
  var n = input[1];
  return {
    value: n,
    note: get('notes', n % 12)
  };
};

var dial = function dial(input) {
  if (input.length < 2) return null;
  var d = input[1];
  return {
    dial: (d - 1) % 4,
    // 0 - 3
    dialColor: get('dial', 'color', d % 100),
    page: Math.floor((d - 1) / 4),
    // 0 - 3
    pageColor: get('dial', 'page', track(input), d % 100)
  };
};

var pitch = function pitch(input) {
  if (input.length < 3) return null;
  return {
    absolute: input[1],
    relative: input[2]
  };
};

var value = function value(input) {
  if (input.length < 3) return null;

  switch (action(input)) {
    case 'keys':
      return note(input);

    case 'dial':
      return dial(input);

    case 'pitch bend':
      return pitch(input);

    default:
      return {};
  }
};

var velocity = function velocity(input) {
  if (input.length < 3) return -1;
  return input[2];
};

var control = function control(input) {
  var c = get('control', input[0]);
  return {
    track: c,
    action: c,
    velocity: velocity(input),
    value: {}
  };
};

var decode = function decode(input) {
  try {
    if (input.length === 1) return control(input);
    if (input.length === 2) return null;
    return {
      track: track(input),
      action: action(input),
      velocity: velocity(input),
      value: value(input)
    };
  } catch (e) {
    error(input);
  }
};

module.exports = {
  decode: decode,
  velocity: velocity
};

},{"./opz.json":27}],27:[function(require,module,exports){
module.exports={
  "dictionary": {
    "action": {
      "dial": "dial",
      "keys": "keys",
      "pitch": "pitch bend"
    },
    "color": {
      "blue": "blue",
      "green": "green",
      "purple": "purple",
      "red": "red",
      "white": "white",
      "yellow": "yellow"
    },
    "track": {
      "arp": "arp",
      "bass": "bass",
      "chord": "chord",
      "fx1": "fx1",
      "fx2": "fx2",
      "kick": "kick",
      "lead": "lead",
      "lights": "lights",
      "master": "master",
      "module": "module",
      "motion": "motion",
      "perc": "perc",
      "perform": "perform",
      "sample": "sample",
      "snare": "snare",
      "tape": "tape"
    },
    "clock": "clock",
    "kill": "kill",
    "start": "start",
    "stop": "stop"
  },
  "control": {
    "248": "clock",
    "250": "start",
    "252": "stop"
  },
  "action": {
    "128": "keys",
    "129": "keys",
    "130": "keys",
    "131": "keys",
    "132": "keys",
    "133": "keys",
    "134": "keys",
    "135": "keys",
    "136": "keys",
    "137": "keys",
    "138": "keys",
    "139": "keys",
    "140": "keys",
    "141": "keys",
    "142": "keys",
    "143": "keys",
    "144": "keys",
    "145": "keys",
    "146": "keys",
    "147": "keys",
    "148": "keys",
    "149": "keys",
    "150": "keys",
    "151": "keys",
    "152": "keys",
    "153": "keys",
    "154": "keys",
    "155": "keys",
    "156": "keys",
    "157": "keys",
    "158": "keys",
    "159": "keys",
    "176": "dial",
    "177": "dial",
    "178": "dial",
    "179": "dial",
    "180": "dial",
    "181": "dial",
    "182": "dial",
    "183": "dial",
    "184": "dial",
    "185": "dial",
    "186": "dial",
    "187": "dial",
    "188": "dial",
    "189": "dial",
    "190": "dial",
    "191": "dial",
    "224": "pitch bend",
    "225": "pitch bend",
    "226": "pitch bend",
    "227": "pitch bend",
    "228": "pitch bend",
    "229": "pitch bend",
    "230": "pitch bend",
    "231": "pitch bend",
    "232": "pitch bend",
    "233": "pitch bend",
    "234": "pitch bend",
    "235": "pitch bend",
    "236": "pitch bend",
    "237": "pitch bend",
    "238": "pitch bend",
    "239": "pitch bend"
  },
  "track": {
    "128": "kick",
    "129": "snare",
    "130": "perc",
    "131": "sample",
    "132": "bass",
    "133": "lead",
    "134": "arp",
    "135": "chord",
    "136": "fx1",
    "137": "fx2",
    "138": "tape",
    "139": "master",
    "140": "perform",
    "141": "module",
    "142": "lights",
    "143": "motion",
    "144": "kick",
    "145": "snare",
    "146": "perc",
    "147": "sample",
    "148": "bass",
    "149": "lead",
    "150": "arp",
    "151": "chord",
    "152": "fx1",
    "153": "fx2",
    "154": "tape",
    "155": "master",
    "156": "perform",
    "157": "module",
    "158": "lights",
    "159": "motion",
    "176": "kick",
    "177": "snare",
    "178": "perc",
    "179": "sample",
    "180": "bass",
    "181": "lead",
    "182": "arp",
    "183": "chord",
    "184": "fx1",
    "185": "fx2",
    "186": "tape",
    "187": "master",
    "188": "perform",
    "189": "lights",
    "190": "lights",
    "191": "motion",
    "224": "kick",
    "225": "snare",
    "226": "perc",
    "227": "sample",
    "228": "bass",
    "229": "lead",
    "230": "arp",
    "231": "chord",
    "232": "fx1",
    "233": "fx2",
    "234": "tape",
    "235": "master",
    "236": "perform",
    "237": "module",
    "238": "lights",
    "239": "motion"
  },
  "notes": {
    "0": "C",
    "1": "C#",
    "2": "D",
    "3": "D#",
    "4": "E",
    "5": "F",
    "6": "F#",
    "7": "G",
    "8": "G#",
    "9": "A",
    "10": "A#",
    "11": "B"
  },
  "dial": {
    "color": {
      "1": "green",
      "2": "blue",
      "3": "yellow",
      "4": "red",
      "5": "green",
      "6": "blue",
      "7": "yellow",
      "8": "red",
      "9": "green",
      "10": "blue",
      "11": "yellow",
      "12": "red",
      "13": "green",
      "14": "blue",
      "15": "yellow",
      "16": "red",
      "123": "kill"
    },
    "page": {
      "kick": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "snare": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "perc": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "sample": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "bass": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "lead": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "arp": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "blue",
        "10": "blue",
        "11": "blue",
        "12": "blue",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "chord": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "fx1": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "fx2": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "tape": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "master": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "perform": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "module": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "lights": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      },
      "motion": {
        "1": "white",
        "2": "white",
        "3": "white",
        "4": "white",
        "5": "green",
        "6": "green",
        "7": "green",
        "8": "green",
        "9": "purple",
        "10": "purple",
        "11": "purple",
        "12": "purple",
        "13": "yellow",
        "14": "yellow",
        "15": "yellow",
        "16": "yellow",
        "123": "kill"
      }
    }
  }
}

},{}]},{},[1]);
