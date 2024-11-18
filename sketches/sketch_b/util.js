import { Espruino} from "ixfx/io.js";

/** @returns {string} */
export function randomID() {
  let randomID = (Math.random() * 1000).toString().replace(`.`, ``);
  return randomID;
}


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

export class Desktop {
  constructor() {
    this.id = Math.random() * 1000;
    this.element = this.#getElement();
  }

  #getElement() {
    let desktop = document.createElement(`div`);
    desktop.classList.add(`desktop`);
    desktop.id = `desktop-${this.id}`;
    return desktop;
  }

  
}

export class DesktopManager {
  static desktopsContainer = document.querySelector(`.desktops-container`);

  constructor() {
    this.desktops = /** @type Desktop[]*/ ([]);
    this.#showDesktopsElements();
  }

  #addElement() {
    // @ts-ignore
    DesktopManager.desktopsContainer.append(this.desktops.at(-1).element);
  }

  addDesktop() {
    this.desktops.push(new Desktop());
    this.#addElement();
  }

  removeDesktop() {
    if (this.desktops.length > 1) {
      this.desktops.pop()?.element.remove();
    }
  }

  /** @param {Desktop | undefined} currentDesktop */
  hasDesktopAfter(currentDesktop) {
    if (currentDesktop != undefined && currentDesktop == this.desktops.at(- 1)) {
      // console.log(`False`);
      return false;
    } else {
      // console.log(`True`);
      return true;
    }
  }

  listDesktops() {
    for (let desktop of this.desktops) {
      console.log(this.desktops);
    };
  }

  #showDesktopsElements() {
    for (let desktop of this.desktops) {
      DesktopManager.desktopsContainer?.append(desktop.element);
    }
  }
}