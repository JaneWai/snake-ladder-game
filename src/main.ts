import './style.css';
import { Game } from './game/Game';

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  
  // Create game container
  const gameContainer = document.createElement('div');
  gameContainer.className = 'game-container';
  
  // Create board container
  const boardContainer = document.createElement('div');
  boardContainer.className = 'board-container';
  
  // Create canvas for the game board
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 600;
  boardContainer.appendChild(canvas);
  
  // Create controls container
  const controls = document.createElement('div');
  controls.className = 'controls';
  
  // Create player info section
  const playerInfo = document.createElement('div');
  playerInfo.className = 'player-info';
  
  // Create player 1 info
  const player1 = document.createElement('div');
  player1.className = 'player active';
  player1.id = 'player-1';
  
  const player1Name = document.createElement('div');
  player1Name.className = 'player-name';
  player1Name.textContent = 'Player 1';
  
  const player1Position = document.createElement('div');
  player1Position.className = 'player-position';
  player1Position.id = 'player-1-position';
  player1Position.textContent = 'Position: 1';
  
  player1.appendChild(player1Name);
  player1.appendChild(player1Position);
  
  // Create player 2 info
  const player2 = document.createElement('div');
  player2.className = 'player';
  player2.id = 'player-2';
  
  const player2Name = document.createElement('div');
  player2Name.className = 'player-name';
  player2Name.textContent = 'Player 2';
  
  const player2Position = document.createElement('div');
  player2Position.className = 'player-position';
  player2Position.id = 'player-2-position';
  player2Position.textContent = 'Position: 1';
  
  player2.appendChild(player2Name);
  player2.appendChild(player2Position);
  
  playerInfo.appendChild(player1);
  playerInfo.appendChild(player2);
  
  // Create dice container
  const diceContainer = document.createElement('div');
  diceContainer.className = 'dice-container';
  
  const dice = document.createElement('div');
  dice.className = 'dice';
  dice.id = 'dice';
  dice.textContent = '1';
  
  const rollButton = document.createElement('button');
  rollButton.id = 'roll-button';
  rollButton.textContent = 'Roll Dice';
  
  diceContainer.appendChild(dice);
  diceContainer.appendChild(rollButton);
  
  // Create message area
  const message = document.createElement('div');
  message.className = 'message';
  message.id = 'message';
  
  // Add all elements to controls
  controls.appendChild(playerInfo);
  controls.appendChild(diceContainer);
  controls.appendChild(message);
  
  // Add board and controls to game container
  gameContainer.appendChild(boardContainer);
  gameContainer.appendChild(controls);
  
  // Add game container to app
  app.appendChild(gameContainer);
  
  // Initialize the game
  const game = new Game(canvas, rollButton, dice, message);
  game.init();
});
