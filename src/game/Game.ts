import { Board } from './Board';
import { Player } from './Player';
import { Snake } from './Snake';
import { Ladder } from './Ladder';

export class Game {
  private board: Board;
  private players: Player[];
  private currentPlayerIndex: number;
  private dice: HTMLDivElement;
  private rollButton: HTMLButtonElement;
  private message: HTMLDivElement;
  private isMoving: boolean;
  private gameOver: boolean;
  private snakes: Snake[];
  private ladders: Ladder[];

  constructor(
    canvas: HTMLCanvasElement,
    rollButton: HTMLButtonElement,
    dice: HTMLDivElement,
    message: HTMLDivElement
  ) {
    this.board = new Board(canvas);
    this.players = [
      new Player(1, 'red'),
      new Player(2, 'blue')
    ];
    this.currentPlayerIndex = 0;
    this.dice = dice;
    this.rollButton = rollButton;
    this.message = message;
    this.isMoving = false;
    this.gameOver = false;
    
    // Define snakes (from, to)
    this.snakes = [
      new Snake(16, 6),
      new Snake(47, 26),
      new Snake(49, 11),
      new Snake(56, 53),
      new Snake(62, 19),
      new Snake(64, 60),
      new Snake(87, 24),
      new Snake(93, 73),
      new Snake(95, 75),
      new Snake(98, 78)
    ];
    
    // Define ladders (from, to)
    this.ladders = [
      new Ladder(1, 38),
      new Ladder(4, 14),
      new Ladder(9, 31),
      new Ladder(21, 42),
      new Ladder(28, 84),
      new Ladder(36, 44),
      new Ladder(51, 67),
      new Ladder(71, 91),
      new Ladder(80, 100)
    ];
  }

  public init(): void {
    // Draw the initial board
    this.board.draw(this.snakes, this.ladders);
    
    // Draw players at starting position
    this.updatePlayersOnBoard();
    
    // Add event listener for roll button
    this.rollButton.addEventListener('click', () => this.rollDice());
    
    // Set initial message
    this.message.textContent = "Player 1's turn. Click 'Roll Dice' to start.";
  }

  private rollDice(): void {
    if (this.isMoving || this.gameOver) return;
    
    // Disable button during animation
    this.rollButton.disabled = true;
    
    // Generate random number between 1 and 6
    const roll = Math.floor(Math.random() * 6) + 1;
    this.dice.textContent = roll.toString();
    
    // Get current player
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    // Calculate new position
    const newPosition = Math.min(currentPlayer.position + roll, 100);
    
    // Move player
    this.movePlayer(currentPlayer, newPosition);
  }

  private movePlayer(player: Player, targetPosition: number): void {
    this.isMoving = true;
    
    // Update message
    this.message.textContent = `Player ${player.id} rolled a ${this.dice.textContent} and is moving...`;
    
    // Animate movement
    const moveInterval = setInterval(() => {
      if (player.position < targetPosition) {
        player.position++;
        this.updatePlayerPosition(player);
        this.updatePlayersOnBoard();
      } else {
        clearInterval(moveInterval);
        
        // Check for snakes and ladders
        this.checkSnakesAndLadders(player);
      }
    }, 300);
  }

  private checkSnakesAndLadders(player: Player): void {
    // Check if player landed on a snake
    const snake = this.snakes.find(s => s.head === player.position);
    if (snake) {
      this.message.textContent = `Player ${player.id} landed on a snake! Moving from ${snake.head} to ${snake.tail}`;
      
      // Delay the snake movement for visual effect
      setTimeout(() => {
        player.position = snake.tail;
        this.updatePlayerPosition(player);
        this.updatePlayersOnBoard();
        this.finishTurn();
      }, 1000);
      return;
    }
    
    // Check if player landed on a ladder
    const ladder = this.ladders.find(l => l.bottom === player.position);
    if (ladder) {
      this.message.textContent = `Player ${player.id} found a ladder! Climbing from ${ladder.bottom} to ${ladder.top}`;
      
      // Delay the ladder movement for visual effect
      setTimeout(() => {
        player.position = ladder.top;
        this.updatePlayerPosition(player);
        this.updatePlayersOnBoard();
        this.finishTurn();
      }, 1000);
      return;
    }
    
    // If no snake or ladder, finish turn normally
    this.finishTurn();
  }

  private finishTurn(): void {
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    // Check for win condition
    if (currentPlayer.position === 100) {
      this.gameOver = true;
      this.message.textContent = `Player ${currentPlayer.id} wins!`;
      this.rollButton.textContent = 'New Game';
      this.rollButton.classList.add('new-game-btn');
      this.rollButton.disabled = false;
      
      // Change roll button to new game button
      this.rollButton.removeEventListener('click', () => this.rollDice());
      this.rollButton.addEventListener('click', () => this.resetGame());
      return;
    }
    
    // Switch to next player
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    
    // Update player UI to show active player
    document.getElementById(`player-1`)?.classList.toggle('active', this.currentPlayerIndex === 0);
    document.getElementById(`player-2`)?.classList.toggle('active', this.currentPlayerIndex === 1);
    
    // Update message
    this.message.textContent = `Player ${this.players[this.currentPlayerIndex].id}'s turn`;
    
    // Enable roll button
    this.rollButton.disabled = false;
    this.isMoving = false;
  }

  private updatePlayerPosition(player: Player): void {
    const positionElement = document.getElementById(`player-${player.id}-position`);
    if (positionElement) {
      positionElement.textContent = `Position: ${player.position}`;
    }
  }

  private updatePlayersOnBoard(): void {
    this.board.draw(this.snakes, this.ladders);
    this.players.forEach(player => {
      this.board.drawPlayer(player);
    });
  }

  private resetGame(): void {
    // Reset players
    this.players.forEach(player => {
      player.position = 1;
      this.updatePlayerPosition(player);
    });
    
    // Reset game state
    this.currentPlayerIndex = 0;
    this.gameOver = false;
    this.isMoving = false;
    
    // Reset UI
    document.getElementById('player-1')?.classList.add('active');
    document.getElementById('player-2')?.classList.remove('active');
    this.rollButton.textContent = 'Roll Dice';
    this.rollButton.classList.remove('new-game-btn');
    
    // Reset message
    this.message.textContent = "Player 1's turn. Click 'Roll Dice' to start.";
    
    // Reset dice
    this.dice.textContent = '1';
    
    // Redraw board
    this.updatePlayersOnBoard();
    
    // Reset button event listener
    this.rollButton.removeEventListener('click', () => this.resetGame());
    this.rollButton.addEventListener('click', () => this.rollDice());
  }
}
