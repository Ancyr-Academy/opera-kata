import { Seat } from './seat';

export class Row {
  private seats: Seat[] = [];

  private position: number;

  constructor(config: { position: number; seats: Seat[] }) {
    this.position = config.position;
    this.seats = config.seats;
  }

  getPosition() {
    return this.position;
  }

  findAvailableSeats(quantity: number) {
    let seats = [];
    for (const seat of this.seats) {
      if (seat.isAvailable()) {
        seats.push(seat);

        if (seats.length === quantity) {
          break;
        }
      } else {
        seats = [];
      }
    }

    return seats;
  }
}
