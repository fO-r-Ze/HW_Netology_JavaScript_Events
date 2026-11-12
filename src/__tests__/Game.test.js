// Game.test.js
import Game from '../Game.js';

// Мокаем импорт картинки (jest уже настроен через moduleNameMapper)
jest.mock('../img/goblin.png', () => 'mocked-image-path');

describe('Game (гоблины)', () => {  
  let container;
  let game;
  let title;

  beforeEach(() => {
    jest.useFakeTimers();

    container = document.createElement('div');
    container.id = 'game-container';
    document.body.appendChild(container);

    // jsdom не загружает index.html — создаём заголовок вручную
    title = document.createElement('h1');
    title.id = 'game-title';
    title.textContent = 'Поймай гоблина!';
    document.body.appendChild(title);

    game = new Game(container, { size: 4, showTime: 1000, maxMisses: 5 });
  });

  afterEach(() => {
    game.destroy();
    document.body.removeChild(container);
    if (title && title.parentNode) title.parentNode.removeChild(title);
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('init создаёт поле 4x4, счётчики и гоблина', () => {
    game.init();
    expect(container.querySelector('.game-field')).toBeTruthy();
    expect(container.querySelectorAll('.cell').length).toBe(16);
    expect(container.querySelector('#score-display')).toBeTruthy();
    expect(container.querySelector('#misses-display')).toBeTruthy();
    expect(container.querySelector('.restart-button')).toBeTruthy();
    expect(game.goblin.element).toBeTruthy();
    expect(game.goblin.element.closest('.cell')).toBeTruthy();
  });

  test('init добавляет обработчик клика на контейнер', () => {
    const addEventListenerSpy = jest.spyOn(container, 'addEventListener');
    game.init();
    expect(addEventListenerSpy).toHaveBeenCalledWith('click', game.handleClick);
    addEventListenerSpy.mockRestore();
  });

  test('клик по гоблину увеличивает счёт и скрывает гоблина', () => {
    game.init();
    const cell = game.goblin.element.closest('.cell');
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(game.scoreboard.score).toBe(1);
    expect(game.scoreboard.scoreElement.textContent).toBe('Счёт: 1');
    // Гоблин скрыт сразу после клика
    expect(game.goblin.element.parentNode).toBeNull();
  });

  test('клик по пустой ячейке не увеличивает счёт и не штрафует', () => {
    game.init();
    const goblinCell = game.goblin.element.closest('.cell');
    const emptyCell = Array.from(container.querySelectorAll('.cell'))
      .find((c) => c !== goblinCell);
    emptyCell.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(game.scoreboard.score).toBe(0);
    expect(game.scoreboard.misses).toBe(0);
  });

  test('если не кликнули за 1 секунду — счётчик пропусков растёт', () => {
    game.init();
    jest.advanceTimersByTime(1000);
    expect(game.scoreboard.misses).toBe(1);
  });

  test('после 5 пропусков игра завершается и показывается кнопка «Играть снова»', () => {
    game.init();
    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(1000); // гоблин исчезает (пропуск)
      jest.advanceTimersByTime(500);  // пауза перед следующим раундом
    }
    expect(game.scoreboard.misses).toBe(5);
    expect(game.gameOver).toBe(true);
    expect(game.restartButton).toBeTruthy();
    expect(game.restartButton.style.display).toBe('inline-block');
  });

  test('кнопка «Играть снова» перезапускает игру и сбрасывает счёт', () => {
  game.init();
  // 5 пропусков → game over
  for (let i = 0; i < 5; i++) {
    jest.advanceTimersByTime(1000);
    jest.advanceTimersByTime(500);
  }
  expect(game.gameOver).toBe(true);

  game.restartButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

  expect(game.gameOver).toBe(false);
  expect(game.scoreboard.score).toBe(0);
  expect(game.scoreboard.misses).toBe(0);
  expect(game.restartButton.style.display).not.toBe('inline-block');
});

  test('клик по гоблину сбрасывает таймер пропуска', () => {
    game.init();
    const cell = game.goblin.element.closest('.cell');
    cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Прошло больше секунды — но пропуска быть не должно,
    // потому что таймер был сброшен кликом
    jest.advanceTimersByTime(1000);
    expect(game.scoreboard.misses).toBe(0);
    expect(game.scoreboard.score).toBe(1);
  });

  test('stop останавливает таймеры и снимает обработчик', () => {
    const removeEventListenerSpy = jest.spyOn(container, 'removeEventListener');
    game.init();
    game.stop();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', game.handleClick);
    expect(game.showTimeoutId).toBeNull();
    expect(game.nextRoundTimeoutId).toBeNull();
    expect(game.gameOver).toBe(true);

    removeEventListenerSpy.mockRestore();
  });

  test('destroy очищает контейнер и сбрасывает ссылки на компоненты', () => {
    game.init();
    game.destroy();

    expect(container.innerHTML).toBe('');
    expect(game.goblin.element).toBeNull();
    expect(game.field.cells).toEqual([]);
    expect(game.scoreboard.scoreElement).toBeNull();
    expect(game.scoreboard.missesElement).toBeNull();
    expect(game.restartButton).toBeNull();
  });

  test('после destroy можно создать и запустить новую игру', () => {
    game.init();
    game.destroy();

    const newGame = new Game(container, { size: 4, showTime: 1000, maxMisses: 5 });
    newGame.init();

    expect(newGame.field.cells.length).toBe(16);
    expect(newGame.goblin.element).toBeTruthy();
    expect(container.querySelector('.game-field')).toBeTruthy();

    newGame.destroy();
  });

  test('при завершении игры заголовок заменяется результатом', () => {
    game.init();
    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(500);
    }
    expect(game.gameOver).toBe(true);
    expect(game.titleElement.textContent).toContain('Игра окончена!');
  });

  test('после «Играть снова» заголовок возвращается к «Поймай гоблина!»', () => {
    game.init();
    for (let i = 0; i < 5; i++) {
      jest.advanceTimersByTime(1000);
      jest.advanceTimersByTime(500);
    }
    game.restartButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(game.titleElement.textContent).toBe('Поймай гоблина!');
    expect(game.gameOver).toBe(false);
  });
});