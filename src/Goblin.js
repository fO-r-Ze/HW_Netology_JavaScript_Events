import goblinImage from './img/goblin.png';

export default class Goblin {
  constructor() {
    this.element = null;
    this.currentCell = null;
  }

  create() {
    this.element = document.createElement('img');
    this.element.src = goblinImage;
    this.element.alt = 'Гоблин';
    this.element.className = 'goblin';
    this.element.draggable = false;
    return this.element;
  }

  show(cell) {
    if (!this.element) this.create();
    // appendChild автоматически перемещает узел из старого родителя
    cell.appendChild(this.element);
    this.currentCell = cell;
  }

  hide() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
    }
    this.currentCell = null;
  }

  isInCell(cell) {
    return !!this.element && this.element.parentNode === cell;
  }

  destroy() {
    this.hide();
    this.element = null;
  }
}