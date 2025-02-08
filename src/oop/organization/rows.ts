import { Row } from './row';
import { Location, ReservableSeat, Search } from '../types';

export class Rows {
  private rows: Row[] = [];

  private location: Location;

  constructor(config: { rows: Row[]; location: Location }) {
    this.rows = config.rows;
    this.location = config.location;
  }

  findSuitableSeats(search: Search): ReservableSeat[] | null {
    const searchPreference = search.searchPreference || 'back-to-front';
    const rows =
      searchPreference === 'front-to-back'
        ? this.rows.slice().reverse()
        : this.rows;

    for (const row of rows) {
      const seats = row.findAvailableSeats(search.quantity);
      if (seats.length === search.quantity) {
        return seats.map((seat) => ({
          location: this.location,
          row: row.getPosition(),
          position: seat.getPosition(),
        }));
      }
    }

    return null;
  }
}
