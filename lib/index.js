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
const tetrisLevelUpRate = 0.2;
const tetrisLevelUpCap = 5;
const keyThrottle = 50;
const midiThrottle = 150;
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
const midiDirections = [];
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
  const windowHeight = Math.floor(window.innerHeight*0.76);
  document.getElementById(containerId).style.height =`${window.innerHeight*0.76}px`;
  pixelSize = Math.floor(windowHeight/height);
  canvas.width = width*pixelSize;
  canvas.height = height*pixelSize;
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
    if (e.keyCode == '38') {
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
document.onkeydown = throttle(keyThrottle, checkKey);

const addToArray = (array, value) => {
  if (array.indexOf(value) > -1) return;
  array.push(value);
  return array;
};

const removeFromArray = (array, value) => {
  const index = array.indexOf(value)
  if ( index == -1) return;
  array.splice(index, 1);
  return array;
};

/*
  Handle Midi Input
*/
const midiHandler = (event) => {
  const data = OPZ.decode(event.data);

  if (!opzSettings["listen"][data.track]) return;

  if (data.action === "keys") {
    if (data.velocity > 0) {
      switch(data.value.note) {
        case "F":
          addToArray(midiDirections, "left");
          break;
        case "G":
          addToArray(midiDirections, "down");
          break;
        case "A":
          addToArray(midiDirections, "right");
          break;
        case "D":
          t.rotate("ccw");
          break;
        case "E":
          t.rotate("cw");
          break;
        case "C#":
          if (t.gameOver) reset();
          break;
      }
    } else {
      switch(data.value.note) {
        case "F":
          removeFromArray(midiDirections, "left");
          break;
        case "G":
          removeFromArray(midiDirections, "down");
          break;
        case "A":
          removeFromArray(midiDirections, "right");
          break;
      }
    }
  }
};

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
      if (event.target.id === "midi-connect") {
        midiConnect(target);
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
const midiConnect = (target) => {
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
          midi.selectDevice(deviceId, midiHandler);
          tabSwitch(targetId);
        });
        list.appendChild(item);
      }

      midiSetup(midiDirections, midiThrottle, opzSettings);

      tabSwitch(target);
    } else {
      update("midi-error", "Couldn't find any devices.");
    }
  }, 50);
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
    item.classList.add('active');

    const box = document.createElement('div');
    box.classList.add('box');

    const title = document.createElement('span');
    title.innerHTML = track;

    item.appendChild(box);
    item.appendChild(title);

    item.addEventListener("click", (event) => {
      let target = event.target;

      if (target != item) target = target.parentNode;

      const track = target.getAttribute("data-track");
      const setting = settings["listen"][track];

      setting ? target.classList.remove("active") : target.classList.add("active");

      settings["listen"][track] = !settings["listen"][track];
    });

    tracks.appendChild(item);

    toggle(settingsElement, "active");
  };

  document.getElementById("opz-settings-toggle").addEventListener("click", (event) => {
    const s = document.getElementById("opz-settings-settings");
    toggle(s, "active");
  });
}

/*
 1. Show midi settings menu
 2. Start rendering loop for midi input
*/
const midiSetup = (directions, throttle, settings) => {
  opzSettingsSetup(settings)
  setInterval(() => {
    for (let i = 0; i < directions.length; i++) {
      t.move(directions[i]);
    }
  }, throttle);
}
