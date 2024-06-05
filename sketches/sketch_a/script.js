import { Espruino} from "https://unpkg.com/ixfx/dist/io.js";
import * as Data from "https://unpkg.com/ixfx/dist/data.js";
import { pointTracker } from "https://unpkg.com/ixfx/dist/data.js";

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

function setup() {
  drawWindow();
}

setup();


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

window.addEventListener(`resize`, function(e) {
  drawWindow();
}), true;

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
 * @param {MouseEvent} e 
 */
function onResize(e) {
  const style = window.getComputedStyle(resizableWindow);

  const width = Number.parseInt(style.width);
  const height = Number.parseInt(style.height);

  const minWidth = Number.parseInt(style.minWidth);
  const maxWidth = Number.parseInt(style.maxWidth);

  const minHeight = Number.parseInt(style.minHeight);
  const maxHeight = Number.parseInt(style.maxHeight);

  resizableWindow.style.width = `${width + (e.movementX)}px`;
  resizableWindow.style.height = `${height + (e.movementY)}px`; 

  let power = Math.floor(settings.maxGain - Data.scaleClamped(Math.max(width, height), Math.max(minWidth, minHeight) + 5, Math.max(maxWidth, maxHeight), 0, settings.maxGain));
  power = power / 1000;
  gainNode.gain.setValueAtTime(power, context.currentTime);
  saveState({ power: power }); 
}

// setInterval(() => {
//   if (state.shouldTrigger) {  
//     if (!state.espruino) { console.warn(`Espruino not connected?`); return; }
//     state.espruino.write(`rtpMode([${state.power}], [${50}])\n`);
//   }
// }, 60);

/**
 * 
 * @param {HTMLElement} window 
 */

function drawWindow() {
  const element = resizableWindow;

  const dimensions = {
    minWidth: window.innerWidth / 4,
    minHeight: window.innerHeight / 3,
    maxWidth: window.innerWidth / 1.5,
    maxHeight: window.innerHeight / 1.2,
    width: window.innerWidth / 2,
    height: window.innerWidth / 1.8,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  }

  element.style.minWidth = `${dimensions.minWidth}px`;
  element.style.minHeight = `${dimensions.minHeight}px`;

  element.style.maxWidth = `${dimensions.maxWidth}px`;
  element.style.maxHeight = `${dimensions.maxHeight}px`;

  element.style.width = `${dimensions.maxWidth}px`;
  element.style.height = `${dimensions.maxHeight}px`;

  element.style.top = `${dimensions.centerY - (dimensions.maxHeight / 2) + dimensions.maxHeight / 25}px`;
  element.style.left = `${dimensions.centerX - (dimensions.maxWidth / 2)}px`;
}

setInterval(() => {
  let style = window.getComputedStyle(resizableWindow);

  const dimensions = {
    minWidth: window.innerWidth / 4,
    minHeight: window.innerHeight / 3,
    maxWidth: window.innerWidth / 1.5,
    maxHeight: window.innerHeight / 1.2
  }

  let width = Number.parseInt(style.width);
  let height = Number.parseInt(style.height);

  let increaseAmount = getResizeAmount();
  console.log(increaseAmount);

  if ((width + increaseAmount <= dimensions.maxWidth)) {
    resizableWindow.style.width = `${width + increaseAmount}px`;
  }

  if ((height + increaseAmount <= dimensions.maxHeight)) {
    resizableWindow.style.height = `${height + increaseAmount}px`;
  }

}, 20);


/**
 * @returns {number}
 */
function getResizeAmount() {
  let style = window.getComputedStyle(resizableWindow);

  let width = Number.parseInt(style.width);
  let height = Number.parseInt(style.height);

  let increaseAmount = 10;

  const dimensions = {
    minWidth: window.innerWidth / 4,
    minHeight: window.innerHeight / 3,
    maxWidth: window.innerWidth / 1.5,
    maxHeight: window.innerHeight / 1.2,
    width: window.innerWidth / 2,
    height: window.innerWidth / 1.8,
    centerX: window.innerWidth / 2,
    centerY: window.innerHeight / 2,
  }

  // console.log(`width: ${width}, min: ${dimensions.minWidth}, max: ${dimensions.maxWidth}`);
  increaseAmount = 1000 - Data.scaleClamped(width, dimensions.minWidth, dimensions.maxWidth, 0, 1000);
  increaseAmount = (increaseAmount / 500) * 6;

  return increaseAmount;
}