import './css/styles.css';
import Game from './Game.js';

const container = document.getElementById('game-container');
const game = new Game(container, { size: 4, showTime: 1000, maxMisses: 5 });
game.init();