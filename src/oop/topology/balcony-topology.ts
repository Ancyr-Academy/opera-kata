import { Row } from '../organization/row';
import { ReservableSeat, Search } from '../organization/types';
import { Lodge } from '../organization/lodge';
import { Rows } from '../organization/rows';
import { Lodges } from '../organization/lodges';
import { Topology } from '../reservation/topology';

export class BalconyTopology implements Topology {
  private lodges: Lodges;

  private rows: Rows;

  constructor(config: { balconyRows: Row[]; lodges: Lodge[] }) {
    this.lodges = new Lodges({
      lodges: config.lodges,
      location: 'balcony',
    });

    this.rows = new Rows({
      rows: config.balconyRows,
      location: 'balcony',
    });
  }

  findSuitableSeats(search: Search): ReservableSeat[] | null {
    const seats = this.lodges.findSuitableSeats(search);
    if (seats) {
      return seats;
    }

    if (search.lodgeOnly === true) {
      return null;
    }

    return this.rows.findSuitableSeats(search);
  }
}
