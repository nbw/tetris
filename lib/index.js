import OPZ from "opzjs";
import Tetris from "./tetris/tetris";
import Midi from "./midi";
import {
  render,
  update,
  toggle,
  showGameButtons,
  hideGameButtons,
} from "./render";

const tetrisWidth = 10;
const tetrisHeight = 20;
const tetrisBaseClock = 750;
const tetrisLevelUpRate = 0.15;
const tetrisLevelUpCap = 5;
const keyThrottle = 50;
const midiThrottle = 125;
let pixelSize = 0;
const fps = 20;

const t = new Tetris(
  tetrisWidth,
  tetrisHeight,
  tetrisBaseClock,
  tetrisLevelUpCap,
  tetrisLevelUpRate
);

const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const midi = new Midi();

/*
 Web Midi API is NOT supported by a few common browers
 */
if (!midi.supported) {
  const unsupported = document.getElementById("unsupported").getAttribute("data-tab");
  const setupBtn = document.getElementById("midi-setup");
  setupBtn.setAttribute('data-target', unsupported);
}

// Keep track of which keys are pressed
const midiDirections = {};

const opzSettings = {
  "listen": {
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
    "perform": true,
    "perform": true,
    "module": true,
    "lights": true,
    "motion": true
  }
};

/*
  Setup canvas size based on window height.
*/
const setupCanvas = (canvas, width, height, containerId) => {
  const windowHeight = Math.floor(window.innerHeight*0.75);
  document.getElementById(containerId).style.height =`${window.innerHeight*0.78}px`;

  pixelSize = Math.floor(windowHeight/height);
  canvas.width = width*pixelSize;
  canvas.height = height*pixelSize;

  const control = document.getElementById("controls").getElementsByTagName("img")[0];
  control.style.height =`${window.innerHeight*0.20}px`;
}

// Rendering loop
setInterval(() => {
  render(ctx, t, pixelSize);
  update("score", t.score);
  update("level", t.level());
}, fps);

/*
  Game clock
*/
const clock = () => {
  t.next()
  if (t.gameOver) showGameButtons();
  setTimeout(clock, t.clock());
};
setupCanvas(canvas, t.width, t.height, "game");
clock();

// Reset game
const reset = () => {
  hideGameButtons();
  t.reset();
};

document.getElementById("restart").addEventListener("click", (e) => {
  reset();
  e.target.innerHTML = "Try again?";
});

// Throttle Input
// Credit: https://codeburst.io/throttling-and-debouncing-in-javascript-646d076d0a44
const throttle = (delay, fn) => {
  let lastCall = 0;
  return function (...args) {
    const now = (new Date).getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return fn(...args);
  }
}

// Keyboard Events
const checkKey = (e) => {
    e = e || window.event;
    console.log(e.keyCode);
    if (e.keyCode == '38' || e.keyCode == '32') {
      // up arrow
      t.rotate("cw");
    }
    else if (e.keyCode == '40') {
      // down arrow
      t.move("down");
    }
    else if (e.keyCode == '37') {
      // left arrow
      t.move("left");
    }
    else if (e.keyCode == '39') {
      // right arrow
      t.move("right");
    }
};
document.addEventListener('keydown', throttle(keyThrottle, checkKey));

/*
  Handle OP-Z Midi Input
*/
const opzMidiHandler = (event) => {
  const data = OPZ.decode(event.data);

  if (!opzSettings["listen"][data.track]) return;

  if (data.action === "keys") {
    let action = null;
    switch(data.value.note) {
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
const midiHandler = (event) => {
  const data = event.data;

  if (data.length < 3) return;

  const key = data[1] % 12;
  const velocity = data[2];

  let action = null;

  if (velocity > 0) {
    switch(key) {
      case 5: // F
        action = "left";
        break;
      case 7: // G
        action = "down";
        break;
      case 9: // A
        action = "right";
        break;
      case 2: // D
        action = "ccw";
        break;
      case 4: // E
        action = "cw";
        break;
      case 1: // C#
        if (t.gameOver) reset();
        break;
    }

    if (action) {
      // Throttle midi input
      const prev = midiDirections[action] || 0;
      const now = (new Date).getTime();
      if (now - prev > midiThrottle) {
        switch(action) {
          case "ccw":
          case "cw":
            t.rotate(action)
            break;
          default:
            t.move(action);
        }
        midiDirections[action] = now;
      }
    }
  }
};

/*
  Processes left, right, up, down

  Uses setInterval to simulate holding a key
*/
const processAction = (action, velocity) => {
  if (velocity > 0) {
    if (midiDirections[action]) return;

    midiDirections[action] = setInterval(() => {
      t.move(action)
    }, midiThrottle);
  } else {
    const interval = midiDirections[action];
    midiDirections[action] = null;
    clearInterval(interval);
  }
}

/*
 Navigation Handling
*/
const main = document.getElementById("main");
const buttons = main.getElementsByTagName("button");
const tabs = main.getElementsByClassName("tab");
for (const button of buttons) {
  const target = button.getAttribute("data-target");
  if (target) {
    button.addEventListener('click', (event) => {
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

/*
  Switch between tabs
 */
const tabSwitch = (target) => {
  for (const tab of tabs) {
    const tabId = tab.getAttribute("data-tab");
    if (tabId === target) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  }
};

/*
  List midi-devices with click handler
*/
const midiConnect = (target, handler) => {
  midi.setup();
  setTimeout( () => {
    if (midi.devices.length > 0) {
      const list = document.getElementById("devices");
      const item = document.createElement('li');
      for (let i = 0; i < midi.devices.length; i++) {
        item.innerHTML = midi.devices[i].name;
        item.setAttribute('data-device', i);
        item.setAttribute('data-target', "5");
        item.addEventListener('click', (event) => {
          const deviceId = parseInt(event.target.getAttribute("data-device"));
          const targetId = event.target.getAttribute("data-target");
          midi.selectDevice(deviceId, handler);
          tabSwitch(targetId);
        });
        list.appendChild(item);
      }

      tabSwitch(target);
    } else {
      update("opz-midi-error", "Couldn't find any devices.");
      update("midi-error", "Couldn't find any devices.");
    }
  }, 250);
};

/*
  Setup OP-Z Settings menu
*/
const opzSettingsSetup = (settings) => {
  const settingsElement = document.getElementById("opz-settings");

  for (let track of Object.keys(settings["listen"])) {
    const tracks = document.getElementById("tracks");

    const item = document.createElement('li');
    item.setAttribute('data-track', track);
    toggle(item, "active");

    const box = document.createElement('div');
    toggle(box, "box");

    const title = document.createElement('span');
    title.innerHTML = track;

    item.appendChild(box);
    item.appendChild(title);

    item.addEventListener("click", (event) => {
      let target = event.target;

      if (target != item) target = target.parentNode;

      const track = target.getAttribute("data-track");

      toggle(target, "active");

      settings["listen"][track] = !settings["listen"][track];
    });

    tracks.appendChild(item);
  };

  toggle(settingsElement, "active");

  document.getElementById("opz-settings-toggle").addEventListener("click", (event) => {
    const s = document.getElementById("opz-settings-settings");
    toggle(s, "active");
  });
}
