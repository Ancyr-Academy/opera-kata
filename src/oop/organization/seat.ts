export class Seat {
  private available: boolean = true;
  private position: number;

  constructor(config: { available: boolean; position: number }) {
    this.available = config.available;
    this.position = config.position;
  }

  isAvailable() {
    return this.available === true;
  }

  getPosition() {
    return this.position;
  }
}
