import Field from './Field.js';
import Goblin from './Goblin.js';
import Scoreboard from './Scoreboard.js';

export default class Game {
  constructor(container, { size = 4, showTime = 1000, maxMisses = 5 } = {}) {
    this.container = container;
    this.size = size;
    this.showTime = showTime;
    this.maxMisses = maxMisses;

    this.field = null;
    this.goblin = null;
    this.scoreboard = null;
    this.restartButton = null;

    this.titleElement = document.getElementById('game-title');
    this.defaultTitle = 'Поймай гоблина!';

    this.showTimeoutId = null;
    this.nextRoundTimeoutId = null;
    this.gameOver = false;

    this.handleClick = this.handleClick.bind(this);
    this.handleRestart = this.handleRestart.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }

  init() {
    this.container.innerHTML = '';
    this.container.classList.add('game');
    this.container.style.position = 'relative';

    this.setTitle(this.defaultTitle);

    this.field = new Field(this.container, this.size);
    this.field.create();

    this.scoreboard = new Scoreboard(this.container, this.maxMisses);
    this.scoreboard.create();

    this.goblin = new Goblin();
    this.createRestartButton();

    this.gameOver = false;

    this.container.addEventListener('click', this.handleClick);
    document.addEventListener('mousedown', this.handleMouseDown);
    document.addEventListener('mouseup', this.handleMouseUp);

    this.startNextRound();
  }

  setTitle(text) {
    if (this.titleElement) this.titleElement.textContent = text;
  }

  handleMouseDown(event) {
    // Меняем курсор только если нажали внутри игрового контейнера
    if (this.container.contains(event.target)) {
      this.container.classList.add('is-hitting');
    }
  }

  handleMouseUp() {
    this.container.classList.remove('is-hitting');
  }

  createRestartButton() {
    if (this.restartButton && this.restartButton.parentNode) {
      this.restartButton.remove();
    }
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'restart-button';
    btn.textContent = 'Играть снова';
    btn.addEventListener('click', this.handleRestart);
    this.container.appendChild(btn);
    this.restartButton = btn;
  }

  handleRestart() {
    this.restart();
  }

  showRestartButton() {
    if (this.restartButton) this.restartButton.style.display = 'inline-block';
  }

  hideRestartButton() {
    if (this.restartButton) this.restartButton.style.display = 'none';
  }

  startNextRound() {
    if (this.gameOver) return;

    if (this.goblin) this.goblin.hide();

    const exclude = this.goblin ? this.goblin.currentCell : null;
    const cell = this.field.getRandomCell(exclude);
    this.goblin.show(cell);

    this.showTimeoutId = setTimeout(() => {
      this.onGoblinMissed();
    }, this.showTime);
  }

  onGoblinMissed() {
    if (this.gameOver) return;
    this.showTimeoutId = null;

    this.goblin.hide();
    this.scoreboard.addMiss();

    if (this.scoreboard.misses >= this.maxMisses) {
      this.endGame();
      return;
    }

    this.nextRoundTimeoutId = setTimeout(() => {
      this.startNextRound();
    }, 500);
  }

  handleClick(event) {
    if (this.gameOver) return;

    const cell = event.target.closest('.cell');
    if (!cell) return;

    if (this.goblin && this.goblin.isInCell(cell)) {
      clearTimeout(this.showTimeoutId);
      this.showTimeoutId = null;

      this.scoreboard.addScore();
      this.goblin.hide();

      this.nextRoundTimeoutId = setTimeout(() => {
        this.startNextRound();
      }, 300);
    }
  }

  endGame() {
    this.gameOver = true;
    clearTimeout(this.showTimeoutId);
    clearTimeout(this.nextRoundTimeoutId);
    this.showTimeoutId = null;
    this.nextRoundTimeoutId = null;
    this.goblin.hide();

    this.setTitle(
      'Игра окончена!'
    );
    this.showRestartButton();
  }

  restart() {
    this.stop();
    this.init();
  }

  stop() {
    clearTimeout(this.showTimeoutId);
    clearTimeout(this.nextRoundTimeoutId);
    this.showTimeoutId = null;
    this.nextRoundTimeoutId = null;
    this.container.removeEventListener('click', this.handleClick);
    document.removeEventListener('mousedown', this.handleMouseDown);
    document.removeEventListener('mouseup', this.handleMouseUp);
    this.container.classList.remove('is-hitting');
    this.gameOver = true;
  }

  destroy() {
    this.stop();
    if (this.goblin) this.goblin.destroy();
    if (this.scoreboard) this.scoreboard.destroy();
    if (this.restartButton && this.restartButton.parentNode) {
      this.restartButton.removeEventListener('click', this.handleRestart);
      this.restartButton.remove();
    }
    this.restartButton = null;
    if (this.field) this.field.clear();
    this.container.innerHTML = '';
    this.container.classList.remove('game');
    this.setTitle(this.defaultTitle);
  }
}