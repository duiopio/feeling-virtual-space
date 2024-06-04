

/** @returns {string} */
export function randomID() {
  let randomID = (Math.random() * 1000).toString().replace(".", "");
  return randomID;
}
