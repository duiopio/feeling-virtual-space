import { Espruino} from "https://unpkg.com/ixfx/dist/io.js";



/**
 * Triggers a effect, referenced by number of name
 * @param {string|number} triggerWhat 
 * @param {Espruino.EspruinoSerialDevice|undefined} espruino
 * @returns 
 */
export function trigger(triggerWhat, espruino) {
  // const { debug } = settings;

  if (!triggerWhat) throw new Error(`triggerWhat parameter missing`);
  
  // Check we initialised OK
  if (!espruino) {
    console.warn(`Espruino not connected?`);
    return;
  }

  // Send command to Pico
  espruino.write(`trigger('${triggerWhat}')\n`);
};

/**
 * Triggers a custom haptic feedback defined by a set of powers and durations
 * @param {number[]} power 
 * @param {number[]} durations
 * @param {Espruino.EspruinoSerialDevice|undefined} espruino
 * @returns 
 */
export function triggerCustomPattern(power, durations, espruino) {
  // const { debug } = settings;

  if (!power && !durations) throw new Error(`triggerWhat parameter missing`);
  
  // Check we initialised OK
  if (!espruino) {
    console.warn(`Espruino not connected?`);
    return;
  }

  // Send command to Pico
  espruino.write(`rtpMode([${power.toString()}], [${durations.toString()}])\n`);
};


/**
 * Divides the haptic feedback into two different types depending
 * on the motor that they are targeted to. The ERM motor will receive
 * the first set of haptic feedback, while the LRA motor will receive
 * the second set of haptic feedback.
 * @param {number[]} ermPowers 
 * @param {number[]} ermDurations 
 * @param {number[]} lraPowers 
 * @param {number[]} lraDurations
 * @param {Espruino.EspruinoSerialDevice|undefined} espruino
 */
export function differentiatedTrigger(ermPowers, ermDurations, lraPowers, lraDurations, espruino) {
  // const { debug } = settings;

  if (!ermPowers && !ermDurations && !lraPowers && !lraDurations) throw new Error(`Missing durations and powers for both motors`);

  // Check we initialised OK
  if (!espruino) {
    console.warn(`Espruino not connected?`);
    return;
  }

  // Send command to Pico
  espruino.write(`customTrigger([${ermPowers.toString()}], [${ermDurations.toString()}], [${lraPowers.toString()}], [${lraDurations.toString()}])\n`);
}