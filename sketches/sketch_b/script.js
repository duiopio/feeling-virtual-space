import { Espruino} from "ixfx/io.js";
import * as Numbers from "ixfx/numbers.js";
import { point } from "ixfx/trackers.js";
import * as Mouse from "./espruino.js";
import { SingleTrigger, Desktop, DesktopManager } from "./util.js";


// Taken from 'weya ou' on StackOverflow: https://stackoverflow.com/a/63501662
const audioPlay = (() => {
  let context = null;
  return async url => {
    if (context) context.close();
    context = new AudioContext();
    const source = context.createBufferSource();
    source.buffer = await fetch(url)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
      .catch(err => console.error(err));
    source.connect(context.destination);
    source.start();
    

    setTimeout(() => {
      source.stop();
    }, 50);
  };
})();


/** START ESPRUINO UTIL */
// Adapted from ixfx-demos at: https://github.com/ClintH/ixfx-demos/blob/main/io/espruino/drv2605/script.js

/** Initiates connection */
const connect = async () => {
  try {
    // Connect to via serial
    const p = await Espruino.serial();

    // Listen for events
    p.addEventListener(`change`, onEspruinoStateChange);
    p.addEventListener(`data`, onEspruinoData);

    saveState({ espruino: p, connected: true });
  } catch (error) {
    // console.error(error);
  }
};

function onEspruinoStateChange(event) { 
  if (settings.debug) {
    // console.log(`${event.priorState} -> ${event.newState}`);
  }
}

function onEspruinoData(event) {
  if (settings.debug) {
    // console.log(event.data);
  }
}

function onEspruinoConnected(connected) {
  if (!connected) {

    throw new Error(settings.debug ? `Espruino not connected` : `Mouse not connected. Try refreshing the page`);
    return;
  }

  // Show UI
}

/** END ESPRUINO UTIL */

/** START CUSTOM CLASSES */
class Bump {
  constructor() {
    this.center = window.innerWidth / 2;
    this.breadth = 80;

    this.left = this.center - (this.breadth / 2);
    this.right = this.center + (this.breadth / 2);
  }

  adjust(breadth, center = this.center) {
    this.center = center;
    this.breadth = breadth;
    this.left = this.center - (this.breadth / 2);
    this.right = this.center + (this.breadth / 2);
  }
}

class BarrierManager {
  constructor() {
    this.lastSide = `left`;
  }

  toggle() {
    this.lastSide = this.lastSide == `left` ? `right` : `left`;
  }
}

/** END CUSTOM CLASSES */

/** START STATE MANAGEMENT */
/**
 * @typedef {{
 * currentDesktop: Desktop | undefined
 * espruino: Espruino.EspruinoSerialDevice | undefined
 * connected: boolean
 * }} State
 */

/**
 * @type {State}
 */
let state = Object.freeze({
  currentDesktop: undefined,
  /** @type {Espruino.EspruinoSerialDevice|undefined} */
  espruino: undefined,
  /** @type {boolean} */
  connected: false,
});


const settings = Object.freeze({
  /** @type Data.PointTracker */
  tracker: point({ sampleLimit: 100 }),
  /** @type boolean */
  debug: false,
  /** @type SingleTrigger */
  triggerManager: new SingleTrigger(),
  // /** @type DesktopManager */
  // desktopManager: new DesktopManager(),
  /** @type {{wWidth: number}} */
  globalValues: {
    wWidth: window.innerWidth,
  },
  /** @type {Bump} */
  bump: new Bump(),
});

/**
 * @param {Partial<state>} s 
 */
function saveState (s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}

/** END STATE MANAGEMENT */

// DOM ELEMENTS
const desktopsContainer = document.querySelector(`.desktops-container`);
const cursorReplacement = /** @type HTMLElement */ (document.querySelector(`.cursor-replacement`));

function setup() {

  document.addEventListener(`keydown`, function(e) {
    switch (e.key) {
      case `c`: {
        connect();
        break;
      }
      default: {
        break;
      }
    }
  });

  settings.triggerManager.triggered = false;

  drawBarrier();
  audioPlay();
}

setup();

document.addEventListener(`mousemove`, function(e) {
  settings.tracker.seen({ x: e.clientX, y: e.clientY });

  if (cursorReplacement !== null) {
    const style = window.getComputedStyle(cursorReplacement);

    let left = Number.parseInt(style.left);
    let top = Number.parseInt(style.top);
    const size = Number.parseInt(style.width);

    left = e.clientX - (size / 2);
    top = e.clientY - (size / 2);

    settings.bump.adjust(50);

    const cursor = {
      x: left,
      y: top,
    };

    if (cursor.x > settings.bump.left && cursor.x < settings.bump.right) {
      if (settings.triggerManager.triggered == false) {
        audioPlay("../../resources/haptic_lo.wav");
        // Mouse.trigger("sharp click 100%", state.espruino);
        settings.triggerManager.triggered = true;
      }
      cursor.x = getClosestSide(e.clientX);
    } else {
      settings.triggerManager.reset();
    }

    cursorReplacement.style.left = `${cursor.x - (size / 2)}px`;
    cursorReplacement.style.top = `${top}px`;
  }
});

function drawBarrier() {
  let prevBarrier = document.getElementById(`barrier`);
  prevBarrier?.remove();

  let barrier = document.createElement(`div`);

  barrier.id = `barrier`;
  barrier.style.backgroundColor = `black`;
  barrier.style.position = `absolute`;
  barrier.style.height = `100vh`;
  barrier.style.left = `${settings.bump.left}px`;
  barrier.style.width = `${settings.bump.breadth}px`;
  barrier.style.cursor = `none`;

  desktopsContainer?.insertBefore(barrier, desktopsContainer.firstChild);
}

function scalarHaptic() {
  const { tracker } = settings;

  let speed = tracker.lastResult?.fromLast.speed;

  if (speed == undefined) return;
  speed = Numbers.scaleClamped(speed, 0, 10, 0, 1);
  // console.log(`speed: ${speed}`);

  if (speed < 0.2) {
    // console.log(`100%`);
    return `sharp click 100%`;
  } else if (speed < 0.55) {
    // console.log(`60%`);
    return `sharp tick 3 60%`;
  } else {
    return `sharp click 30%`;
  }
}

/**
 * @param {number} x 
 * @returns {number}
 */
function getClosestSide(x) {
  const leftDifference = Math.abs(x - settings.bump.left);
  const rightDifference = Math.abs(x- settings.bump.right);

  if (Math.min(leftDifference, rightDifference) == leftDifference) {
    return settings.bump.left;
  } else if (Math.min(leftDifference, rightDifference) == rightDifference) {
    return settings.bump.right;
  }

  return settings.bump.left;
}

window.addEventListener('resize', function(event) {
  settings.bump.adjust(80, window.innerWidth / 2);
  drawBarrier();
}, true);