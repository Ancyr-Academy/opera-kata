import { ReservableSeat, Search } from '../types';
import { Lodge, LodgeSeat } from './lodge';

export class Lodges {
  private lodges: Lodge[] = [];

  private location: 'balcony';

  constructor(config: { lodges: Lodge[]; location: 'balcony' }) {
    this.lodges = config.lodges;
    this.location = config.location;
  }

  findSuitableSeats(search: Search) {
    if (search.quantity > 3) {
      return null;
    }

    return this.findSeats(search);
  }

  private findSeats(search: Search) {
    for (const lodge of this.lodges) {
      const seats = lodge.findAvailableSeats(search.quantity);
      if (seats) {
        return seats.map(this.toSeat.bind(this));
      }
    }

    return null;
  }

  toSeat(seat: LodgeSeat): ReservableSeat {
    return {
      location: this.location,
      lodge: seat.lodge,
      position: seat.position,
    };
  }
}
