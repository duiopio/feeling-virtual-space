import { Espruino} from "https://unpkg.com/ixfx/dist/io.js";
import * as Mouse from "./espruino.js";


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
    try {
      source.connect(context.destination);
    } catch (error) {
      // Ignore error, as it's not breaking
    }
    
    source.start();
    setTimeout(() => {
      source.stop();
    }, 70);
  };
})();

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

const resizableWindow = /** @type HTMLElement */ (document.querySelectorAll(`.resizable`)[0]);
const resizableWindowTwo = /** @type HTMLElement */ (document.querySelectorAll(`.resizable-two`)[0]);
const resizableWindowThree = /** @type HTMLElement */ (document.querySelectorAll(`.resizable-three`)[0]);

// const titlebarOne = resizableWindow.children[0];
// const titlebarTwo = resizableWindowTwo.children[0];
// const titlebarThree = resizableWindowThree.children[0];

// Set up settings for the whole sketch
const settings = Object.freeze({
  debug: true,
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
  shouldTriggerBoundaryFeedback: true,
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

resizableWindow.addEventListener(`mouseenter`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_hi.wav");
});

resizableWindow.addEventListener(`mouseleave`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_hi.wav");
});

resizableWindowTwo.addEventListener(`mouseenter`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_mi.wav");
});

resizableWindowTwo.addEventListener(`mouseleave`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_mi.wav");
});

resizableWindowThree.addEventListener(`mouseenter`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_lo.wav");
});

resizableWindowThree.addEventListener(`mouseleave`, function(e) {
  // Mouse.trigger("sharp click 30%", state.espruino);
  audioPlay("../../resources/haptic_lo.wav");
});

// titlebarOne.addEventListener(`mousedown`, function(e) {
//   document.addEventListener(`mousemove`, onWindowOneDrag);
// });

// titlebarTwo.addEventListener(`mousedown`, function(e) {
//   document.addEventListener(`mousemove`, onWindowTwoDrag);
// });

// titlebarThree.addEventListener(`mousedown`, function(e) {
//   document.addEventListener(`mousemove`, onWindowThreeDrag);
// });

document.addEventListener(`mouseup`, function(e) {
  document.removeEventListener(`mousemove`, onWindowOneDrag);
  document.removeEventListener(`mousemove`, onWindowTwoDrag);
  document.removeEventListener(`mousemove`, onWindowThreeDrag);
});

function onWindowTwoDrag(e) {
  const style = window.getComputedStyle(resizableWindowTwo);

  const left = Number.parseInt(style.left);
  const top = Number.parseInt(style.top);

  /** @type HTMLElement */ (resizableWindowTwo).style.left = `${left + e.movementX}px`;
  /** @type HTMLElement */ (resizableWindowTwo).style.top = `${top + e.movementY}px`;
}

function onWindowOneDrag(e) {
  const style = window.getComputedStyle(resizableWindow);

  const left = Number.parseInt(style.left);
  const top = Number.parseInt(style.top);

  /** @type HTMLElement */ (resizableWindow).style.left = `${left + e.movementX}px`;
  /** @type HTMLElement */ (resizableWindow).style.top = `${top + e.movementY}px`;
}

function onWindowThreeDrag(e) {
  const style = window.getComputedStyle(resizableWindowThree);

  const left = Number.parseInt(style.left);
  const top = Number.parseInt(style.top);

  /** @type HTMLElement */ (resizableWindowThree).style.left = `${left + e.movementX}px`;
  /** @type HTMLElement */ (resizableWindowThree).style.top = `${top + e.movementY}px`;
}