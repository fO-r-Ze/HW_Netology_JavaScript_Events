export default class Scoreboard {
  constructor(container, maxMisses = 5) {
    this.container = container;
    this.maxMisses = maxMisses;
    this.score = 0;
    this.misses = 0;
    this.scoreElement = null;
    this.missesElement = null;
  }

  create() {
    // Счёт — слева от поля
    this.scoreElement = document.createElement('div');
    this.scoreElement.id = 'score-display';
    this.scoreElement.className = 'scoreboard__item scoreboard__item--score';
    this.container.append(this.scoreElement); // было appendChild

    // Пропуски — справа от поля
    this.missesElement = document.createElement('div');
    this.missesElement.id = 'misses-display';
    this.missesElement.className = 'scoreboard__item scoreboard__item--misses';
    this.container.append(this.missesElement); // было appendChild

    this.update();
  }

  update() {
    if (this.scoreElement) this.scoreElement.textContent = `Счёт: ${this.score}`;
    if (this.missesElement) this.missesElement.textContent = `Пропуски: ${this.misses}`;
  }

  addScore() {
    this.score += 1;
    this.update();
  }

  addMiss() {
    this.misses += 1;
    this.update();
  }

  reset() {
    this.score = 0;
    this.misses = 0;
    this.update();
  }

  destroy() {
    if (this.scoreElement && this.scoreElement.parentNode) this.scoreElement.remove();
    if (this.missesElement && this.missesElement.parentNode) this.missesElement.remove();
    this.scoreElement = null;
    this.missesElement = null;
  }
}