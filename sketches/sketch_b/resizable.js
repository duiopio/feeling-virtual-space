// import { differentiatedTrigger } from "./espruino";

// let resizable = /** @type HTMLElement */ (document.querySelector(`.resizable`));

// resizable.addEventListener(`mousedown`, function(e) {
//   // resizable.classList.add("held");
//   window.addEventListener(`mousemove`, onMouseDrag);
// });


// document.addEventListener(`mouseup`, function(e) {
//   // resizable.classList.remove("held");
//   window.removeEventListener(`mousemove`, onMouseDrag);
//   saveState({ hasResized: false });
// });

/**
 * @typedef {{
 * initialCoordinates: {x: number, y: number},
 * cornerCoordinates: {x: number, y: number},
 * hasResized: boolean,
 * }} State

/**
 * @type {State}
 */
let state = Object.freeze({
  initialCoordinates: {x: 0, y: 0},
  cornerCoordinates: {x: 0, y: 0 },
  hasResized: false,
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


// Solution found here: https://www.geeksforgeeks.org/draggable-element-using-javascript/

// /**
//  * 
//  * @param {MouseEvent} e 
//  */
// function onMouseDrag(e) {
//   const { movementX, movementY } = e;

//   let windowStyle = window.getComputedStyle(resizable);
//   let left = Number.parseInt(windowStyle.left);
//   let top = Number.parseInt(windowStyle.top);

//   // Here I just handle movement, resizing is done in CSS
//   if (shouldPreventDrag(e, windowStyle)) {
//     // resizable.style.left = `${left + movementX}px`;
//     // resizable.style.top = `${top + movementY}px`;
//   } else {
//     saveState({ hasResized: true } );
//   }
// }

/**
 * 
 * @param {MouseEvent} e 
 * @param {CSSStyleDeclaration} style
 * @returns {boolean}
 */
function shouldPreventDrag(e, style) {
  const corners = getCornersFor(style);

  if (e.clientX > corners.x - 20 && e.clientY > corners.y - 20) {
    return false;
  } else {
    return true;
  }
}

/**
 * 
 * @param {CSSStyleDeclaration} elementStyle 
 * @returns {{x: number, y: number}}
 */
function getCornersFor(elementStyle) {
  let cornerX = Number.parseInt(elementStyle.left) + Number.parseInt(elementStyle.width);
  let cornerY = Number.parseInt(elementStyle.top) + Number.parseInt(elementStyle.height);

  return { x: cornerX, y: cornerY };
}