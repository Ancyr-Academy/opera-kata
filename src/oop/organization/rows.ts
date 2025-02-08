import { Row } from './row';
import { Location, SearchPreference } from '../types';

export class Rows {
  private rows: Row[] = [];

  private location: Location;

  constructor(config: { rows: Row[]; location: Location }) {
    this.rows = config.rows;
    this.location = config.location;
  }

  findSuitableSeats({
    quantity,
    searchPreference,
  }: {
    quantity: number;
    searchPreference?: SearchPreference;
  }) {
    searchPreference = searchPreference || 'back-to-front';

    if (searchPreference === 'back-to-front') {
      for (const row of this.rows) {
        const seats = row.findAvailableSeats(quantity);
        if (seats.length === quantity) {
          return seats.map((seat) => ({
            location: this.location,
            row: row.getPosition(),
            position: seat.getPosition(),
          }));
        }
      }
    } else if (searchPreference === 'front-to-back') {
      const rows = this.rows.slice().reverse();
      for (const row of rows) {
        const seats = row.findAvailableSeats(quantity);
        if (seats.length === quantity) {
          return seats.map((seat) => ({
            location: this.location,
            row: row.getPosition(),
            position: seat.getPosition(),
          }));
        }
      }
    }

    return null;
  }
}
