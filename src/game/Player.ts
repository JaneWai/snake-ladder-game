export class Player {
  public id: number;
  public position: number;
  public color: string;

  constructor(id: number, color: string) {
    this.id = id;
    this.position = 1; // Start at position 1
    this.color = color;
  }
}
