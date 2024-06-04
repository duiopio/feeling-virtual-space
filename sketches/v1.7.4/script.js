import { Espruino} from "https://unpkg.com/ixfx/dist/io.js";
import * as Data from "https://unpkg.com/ixfx/dist/data.js";
import * as Dom from "https://unpkg.com/ixfx/dist/dom.js";

let context = new AudioContext();
let oscillator = context.createOscillator();
let gainNode = context.createGain();
gainNode.gain.setValueAtTime(0.0001, context.currentTime);
oscillator.type = `triangle`;
oscillator.frequency.setValueAtTime(110, context.currentTime);
oscillator.connect(gainNode);
gainNode.connect(context.destination);

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

export class SingleTrigger {
  triggerThreshold = 0.85;

  constructor() {
    this.triggered = false;
  }

  reset() {
    this.triggered = false;
  }

  toggle() {
    if (this.triggered) {
      this.triggered = false;
    } else {
      this.triggered = true;
    }
  }
}
const titlebar = /** @type HTMLElement */ (document.querySelectorAll(`.titlebar`)[0]);
const resizableWindow = /** @type HTMLElement */ (document.querySelectorAll(`.resizable`)[0]);
const resizeHandle = /** @type HTMLElement */ (document.querySelectorAll(`.resizeHandle`)[0]);

// Set up settings for the whole sketch
const settings = Object.freeze({
  debug: true,
  triggerManager: new SingleTrigger(),
  maxGain: 100,
});

// Keep track of Espruino instance
let state = Object.freeze({
  /** @type {Espruino.EspruinoSerialDevice|undefined} */
  espruino: undefined,
  /** @type {boolean} */
  connected: false,
  /** @type {CSSStyleDeclaration} */
  windowStyle: window.getComputedStyle(resizableWindow),
  /** @type {boolean} */
  shouldTrigger: false,
  /** @type {number} */
  resistance: 1,
  /** @type {number} */
  power: 0,
  /** @type {boolean} */
  oscOn: false,
});

/**
 * Save state
 * @param {Partial<state>} s 
 */
function saveState (s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}

// START ESPRUINO UTIL
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
    console.error(error);

  }
};

function onEspruinoStateChange(event) { 
  if (settings.debug) {
    console.log(`${event.priorState} -> ${event.newState}`);
  }
}

function onEspruinoData(event) {
  if (settings.debug) {
    console.log(event.data);
  }
}

function onEspruinoConnected(connected) {
  if (!connected) {

    throw new Error(settings.debug ? `Espruino not connected` : `Mouse not connected. Try refreshing the page`);
    return;
  }
}

// END ESPRUINO UTIL

resizeHandle.addEventListener(`mousedown`, function(e) {
  if (context.state === `suspended`) context.resume();

  if (state.oscOn === false) { 
    oscillator.start();
    saveState({ oscOn: true });
  }
  document.addEventListener(`mousemove`, onResize);
});

titlebar.addEventListener(`mousedown`, function(e) {
  document.addEventListener(`mousemove`, onMouseDrag);
});

document.addEventListener(`mouseup`, function(e) {
  document.removeEventListener(`mousemove`, onMouseDrag);
  document.removeEventListener(`mousemove`, onResize);
  context.suspend();
  saveState({ shouldTrigger: false });
});

setInterval(() => {
  const style = window.getComputedStyle(resizableWindow);

  const width = Number.parseInt(style.width);
  const height = Number.parseInt(style.height);
  const minWidth = Number.parseInt(style.minWidth);
  const maxWidth = Number.parseInt(style.maxWidth);
  const maxHeight = Number.parseInt(style.maxHeight);
  const left = Number.parseInt(style.left);
  const top = Number.parseInt(style.top);

  const cornerX = left + width;
  const cornerY = top + height;

  const resistance = Math.max(width, height) / Math.max(maxWidth, maxHeight);

  saveState({ resistance: resistance });
}, 100);

/**
 * @param {MouseEvent} e 
 */
function onMouseDrag(e) {
  const style = window.getComputedStyle(resizableWindow);

  const left = Number.parseInt(style.left);
  const top = Number.parseInt(style.top);

  /** @type HTMLElement */ (resizableWindow).style.left = `${left + e.movementX}px`;
  /** @type HTMLElement */ (resizableWindow).style.top = `${top + e.movementY}px`;
}

/**
 * 
 * @param {MouseEvent} e 
 */
function onResize(e) {
  const style = window.getComputedStyle(resizableWindow);

  const width = Number.parseInt(style.width);
  const height = Number.parseInt(style.height);

  const minWidth = Number.parseInt(style.minWidth);
  const maxWidth = Number.parseInt(style.maxWidth);

  resizableWindow.style.width = `${width + (e.movementX)}px`;
  resizableWindow.style.height = `${height + (e.movementY)}px`;

  let power = Math.floor(settings.maxGain - Data.scaleClamped(width, minWidth + 5, maxWidth, 0, settings.maxGain));
  power = power / 1000;
  gainNode.gain.setValueAtTime(power, context.currentTime);
  saveState({ power: power }); 
}

setInterval(() => {
  if (state.shouldTrigger) {  
    if (!state.espruino) { console.warn(`Espruino not connected?`); return; }
    state.espruino.write(`rtpMode([${state.power}], [${50}])\n`);
  }
}, 60);