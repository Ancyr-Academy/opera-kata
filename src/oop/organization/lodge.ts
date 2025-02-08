import { Seat } from './seat';

export type LodgeSeat = {
  lodge: number;
  position: number;
};

export class Lodge {
  private position: number;

  private seats: Seat[] = [];

  constructor(config: { position: number; seats: Seat[] }) {
    this.position = config.position;
    this.seats = config.seats;
  }

  findAvailableSeats(quantity: number) {
    let seats: LodgeSeat[] = [];
    for (const seat of this.seats) {
      if (seat.isAvailable()) {
        seats.push({
          lodge: this.position,
          position: seat.getPosition(),
        });

        if (seats.length === quantity) {
          return seats;
        }
      } else {
        seats = [];
      }
    }

    return null;
  }
}
