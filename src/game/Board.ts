import { Snake } from './Snake';
import { Ladder } from './Ladder';
import { Player } from './Player';

export class Board {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private gridSize: number;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.gridSize = 10; // 10x10 grid
    this.cellSize = canvas.width / this.gridSize;
  }

  public draw(snakes: Snake[], ladders: Ladder[]): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid
    this.drawGrid();
    
    // Draw numbers
    this.drawNumbers();
    
    // Draw snakes
    this.drawSnakes(snakes);
    
    // Draw ladders
    this.drawLadders(ladders);
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 1;
    
    // Draw alternating colored cells
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const cellNumber = this.getCellNumber(row, col);
        
        // Alternate colors for cells
        if ((row + col) % 2 === 0) {
          this.ctx.fillStyle = '#e0e0e0';
        } else {
          this.ctx.fillStyle = '#ffffff';
        }
        
        // Draw cell
        this.ctx.fillRect(
          col * this.cellSize,
          row * this.cellSize,
          this.cellSize,
          this.cellSize
        );
        
        // Draw cell border
        this.ctx.strokeRect(
          col * this.cellSize,
          row * this.cellSize,
          this.cellSize,
          this.cellSize
        );
      }
    }
  }

  private drawNumbers(): void {
    this.ctx.fillStyle = '#333';
    this.ctx.font = `${this.cellSize / 4}px Arial`;
    this.ctx.textAlign = 'center';
    
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const cellNumber = this.getCellNumber(row, col);
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 4;
        
        this.ctx.fillText(cellNumber.toString(), x, y);
      }
    }
  }

  private drawSnakes(snakes: Snake[]): void {
    snakes.forEach(snake => {
      const headCoords = this.getCoordinatesForPosition(snake.head);
      const tailCoords = this.getCoordinatesForPosition(snake.tail);
      
      // Generate path points for a more natural snake shape
      const points = this.generateSnakePath(headCoords, tailCoords);
      
      // Draw snake body with gradient
      this.drawSnakeBody(points);
      
      // Draw snake head
      this.drawSnakeHead(points[0], points[1]);
      
      // Draw snake tail
      this.drawSnakeTail(points[points.length - 2], points[points.length - 1]);
    });
  }

  private generateSnakePath(headCoords: {x: number, y: number}, tailCoords: {x: number, y: number}): {x: number, y: number}[] {
    const points: {x: number, y: number}[] = [];
    const distance = Math.sqrt(
      Math.pow(headCoords.x - tailCoords.x, 2) + 
      Math.pow(headCoords.y - tailCoords.y, 2)
    );
    
    // Number of segments based on distance
    const segments = Math.max(5, Math.floor(distance / 40));
    
    // Create a wavy path with multiple control points
    const dx = (tailCoords.x - headCoords.x) / segments;
    const dy = (tailCoords.y - headCoords.y) / segments;
    const perpX = -dy / distance * 30; // Perpendicular vector for wave (reduced for thinner snake)
    const perpY = dx / distance * 30;
    
    // Add head position
    points.push({x: headCoords.x, y: headCoords.y});
    
    // Generate wavy path points
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const waveAmplitude = Math.sin(t * Math.PI) * 0.5 + 0.5; // Varies from 0 to 1 and back
      
      points.push({
        x: headCoords.x + dx * i + perpX * waveAmplitude * Math.sin(i * 1.5),
        y: headCoords.y + dy * i + perpY * waveAmplitude * Math.sin(i * 1.5)
      });
    }
    
    // Add tail position
    points.push({x: tailCoords.x, y: tailCoords.y});
    
    return points;
  }

  private drawSnakeBody(points: {x: number, y: number}[]): void {
    if (points.length < 2) return;
    
    // Create gradient for snake body - now using red tones
    const gradient = this.ctx.createLinearGradient(
      points[0].x, points[0].y, 
      points[points.length - 1].x, points[points.length - 1].y
    );
    
    // Red snake with darker pattern
    gradient.addColorStop(0, '#c41e3a'); // Darker red at head
    gradient.addColorStop(0.5, '#ff3333'); // Brighter red in middle
    gradient.addColorStop(1, '#c41e3a'); // Darker red at tail
    
    // Draw the main body - thinner line width
    this.ctx.lineWidth = 8; // Reduced from 12 to make snake thinner
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.strokeStyle = gradient;
    
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    // Draw curved path through all points
    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    
    // Last curve
    this.ctx.quadraticCurveTo(
      points[points.length - 2].x, 
      points[points.length - 2].y, 
      points[points.length - 1].x, 
      points[points.length - 1].y
    );
    
    this.ctx.stroke();
    
    // Draw snake pattern (scales)
    this.drawSnakePattern(points);
  }

  private drawSnakePattern(points: {x: number, y: number}[]): void {
    if (points.length < 4) return;
    
    // Skip head and tail points
    for (let i = 1; i < points.length - 2; i++) {
      // Calculate direction to next point
      const dx = points[i + 1].x - points[i].x;
      const dy = points[i + 1].y - points[i].y;
      const angle = Math.atan2(dy, dx);
      
      // Draw diamond pattern on back - smaller for thinner snake
      const patternSize = 4; // Reduced from 6
      const patternSpacing = 20;
      const patternCount = Math.floor(Math.sqrt(dx * dx + dy * dy) / patternSpacing);
      
      for (let j = 0; j < patternCount; j++) {
        const t = j / patternCount;
        const x = points[i].x + dx * t;
        const y = points[i].y + dy * t;
        
        // Draw diamond shape - darker red for pattern
        this.ctx.fillStyle = '#a01a2f'; // Darker red for pattern
        this.ctx.beginPath();
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        this.ctx.moveTo(0, -patternSize);
        this.ctx.lineTo(patternSize, 0);
        this.ctx.lineTo(0, patternSize);
        this.ctx.lineTo(-patternSize, 0);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }

  private drawSnakeHead(headPoint: {x: number, y: number}, nextPoint: {x: number, y: number}): void {
    // Calculate direction
    const dx = nextPoint.x - headPoint.x;
    const dy = nextPoint.y - headPoint.y;
    const angle = Math.atan2(dy, dx);
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(headPoint.x, headPoint.y);
    this.ctx.rotate(angle);
    
    // Draw head - smaller for thinner snake
    const headLength = 16; // Reduced from 20
    const headWidth = 10; // Reduced from 14
    
    // Head shape (oval) - red color
    this.ctx.fillStyle = '#c41e3a'; // Dark red
    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, headLength, headWidth, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Eyes
    this.ctx.fillStyle = 'white';
    this.ctx.beginPath();
    this.ctx.ellipse(-headLength/3, -headWidth/2, 2.5, 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(-headLength/3, headWidth/2, 2.5, 2.5, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Pupils
    this.ctx.fillStyle = 'black';
    this.ctx.beginPath();
    this.ctx.ellipse(-headLength/3 - 1, -headWidth/2, 1.2, 1.2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.beginPath();
    this.ctx.ellipse(-headLength/3 - 1, headWidth/2, 1.2, 1.2, 0, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Tongue
    this.ctx.strokeStyle = '#ff3333';
    this.ctx.lineWidth = 1.5; // Thinner tongue
    this.ctx.beginPath();
    this.ctx.moveTo(headLength - 5, 0);
    this.ctx.lineTo(headLength + 8, -4);
    this.ctx.moveTo(headLength - 5, 0);
    this.ctx.lineTo(headLength + 8, 4);
    this.ctx.stroke();
    
    // Restore context
    this.ctx.restore();
  }

  private drawSnakeTail(prevPoint: {x: number, y: number}, tailPoint: {x: number, y: number}): void {
    // Calculate direction
    const dx = tailPoint.x - prevPoint.x;
    const dy = tailPoint.y - prevPoint.y;
    const angle = Math.atan2(dy, dx);
    
    // Save context for rotation
    this.ctx.save();
    this.ctx.translate(tailPoint.x, tailPoint.y);
    this.ctx.rotate(angle);
    
    // Draw tapered tail - smaller for thinner snake
    this.ctx.fillStyle = '#c41e3a'; // Dark red
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(-12, 4); // Reduced from -15, 6
    this.ctx.lineTo(-20, 0); // Reduced from -25, 0
    this.ctx.lineTo(-12, -4); // Reduced from -15, -6
    this.ctx.closePath();
    this.ctx.fill();
    
    // Restore context
    this.ctx.restore();
  }

  private drawLadders(ladders: Ladder[]): void {
    this.ctx.strokeStyle = '#4caf50';
    this.ctx.lineWidth = 8;
    
    ladders.forEach(ladder => {
      const bottomCoords = this.getCoordinatesForPosition(ladder.bottom);
      const topCoords = this.getCoordinatesForPosition(ladder.top);
      
      // Draw ladder sides
      this.ctx.beginPath();
      this.ctx.moveTo(bottomCoords.x - 10, bottomCoords.y);
      this.ctx.lineTo(topCoords.x - 10, topCoords.y);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(bottomCoords.x + 10, bottomCoords.y);
      this.ctx.lineTo(topCoords.x + 10, topCoords.y);
      this.ctx.stroke();
      
      // Draw rungs
      this.ctx.lineWidth = 3;
      const distance = Math.sqrt(
        Math.pow(topCoords.x - bottomCoords.x, 2) + 
        Math.pow(topCoords.y - bottomCoords.y, 2)
      );
      
      const steps = Math.floor(distance / 30);
      
      for (let i = 0; i <= steps; i++) {
        const ratio = i / steps;
        const x1 = bottomCoords.x - 10 + (topCoords.x - bottomCoords.x) * ratio;
        const y1 = bottomCoords.y + (topCoords.y - bottomCoords.y) * ratio;
        const x2 = bottomCoords.x + 10 + (topCoords.x - bottomCoords.x) * ratio;
        const y2 = y1;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
      }
    });
  }

  public drawPlayer(player: Player): void {
    const coords = this.getCoordinatesForPosition(player.position);
    
    // Draw player token
    this.ctx.fillStyle = player.color;
    this.ctx.beginPath();
    
    // Offset player positions slightly so they don't overlap
    let xOffset = 0;
    let yOffset = 0;
    
    if (player.id === 1) {
      xOffset = -15;
    } else {
      xOffset = 15;
    }
    
    this.ctx.arc(coords.x + xOffset, coords.y + yOffset, 15, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Add player number
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      player.id.toString(),
      coords.x + xOffset,
      coords.y + yOffset + 6
    );
  }

  private getCellNumber(row: number, col: number): number {
    // Calculate cell number based on snake and ladder board pattern
    // (bottom-left is 1, moving right and then up in a zigzag pattern)
    let cellNumber;
    
    if (row % 2 === 0) {
      // Even rows (0, 2, 4, 6, 8) go right to left
      cellNumber = (this.gridSize - row) * this.gridSize - col;
    } else {
      // Odd rows (1, 3, 5, 7, 9) go left to right
      cellNumber = (this.gridSize - row - 1) * this.gridSize + 1 + col;
    }
    
    return cellNumber;
  }

  private getCoordinatesForPosition(position: number): { x: number, y: number } {
    // Convert position (1-100) to grid coordinates
    position = Math.min(Math.max(position, 1), 100);
    
    // Calculate row and column
    const row = this.gridSize - Math.ceil(position / this.gridSize);
    let col;
    
    if ((this.gridSize - row) % 2 === 1) {
      // Odd rows (from bottom) go left to right
      col = (position - 1) % this.gridSize;
    } else {
      // Even rows (from bottom) go right to left
      col = this.gridSize - 1 - ((position - 1) % this.gridSize);
    }
    
    // Return center of cell
    return {
      x: col * this.cellSize + this.cellSize / 2,
      y: row * this.cellSize + this.cellSize / 2
    };
  }
}
