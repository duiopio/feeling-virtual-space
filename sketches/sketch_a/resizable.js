let resizable = /** @type HTMLElement */ (document.getElementsByClassName("resizable")[0]);

/**
 * @typedef {{
 * cornerCoordinates: {x: number, y: number},
 * hasResized: boolean,
 * }} State

/**
 * @type {State}
 */
let state = Object.freeze({
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

/**
 * 
 * @param {CSSStyleDeclaration} elementStyle 
 * @returns {{x: number, y: number}}
 */
function getCornersFor(elementStyle) {
  let cornerX = parseInt(elementStyle.left) + parseInt(elementStyle.width);
  let cornerY = parseInt(elementStyle.top) + parseInt(elementStyle.height);

  return { x: cornerX, y: cornerY };
}