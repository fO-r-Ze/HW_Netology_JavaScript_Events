export default class Field {
  constructor(container, size = 4) {
    this.container = container;
    this.size = size;
    this.cells = [];
    this.fieldElement = null;
  }

  create() {
    this.cells = [];
    this.fieldElement = document.createElement('div');
    this.fieldElement.className = 'game-field';
    this.fieldElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
    this.fieldElement.style.gridTemplateRows = `repeat(${this.size}, 1fr)`;

    for (let i = 0; i < this.size * this.size; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      this.fieldElement.appendChild(cell);
      this.cells.push(cell);
    }

    this.container.appendChild(this.fieldElement);
  }

  getRandomCell(excludeCell = null) {
    let available = this.cells;
    if (excludeCell && available.length > 1) {
      available = this.cells.filter((c) => c !== excludeCell);
    }
    const index = Math.floor(Math.random() * available.length);
    return available[index];
  }

  clear() {
    if (this.fieldElement && this.fieldElement.parentNode) {
      this.fieldElement.remove();
    }
    this.cells = [];
    this.fieldElement = null;
  }
}