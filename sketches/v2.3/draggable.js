class Draggable {
  startX;
  startY;
  startWidth;
  startHeight;

  

  element;

  constructor() {
    this.element = this.getHandleElement();
    this.element.addEventListener('mousedown', this.initDrag);
  }

  getHandleElement() {
    const handle = document.createElement('div');
    handle.classList.add('corner-handle');
    return handle;
  }

  /**
   * @param {MouseEvent} e
   */
  initDrag(e) {
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.startWidth = parseInt(document.defaultView.getComputedStyle(p).width, 10);
    this.startHeight = parseInt(document.defaultView.getComputedStyle(p).height, 10);
    document.documentElement.addEventListener('mousemove', doDrag, false);
    document.documentElement.addEventListener('mouseup', stopDrag, false);
  }
}