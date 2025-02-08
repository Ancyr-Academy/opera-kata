import { Row } from '../organization/row';
import { Search } from '../types';
import { Rows } from '../organization/rows';
import { Topology } from '../topology';

export class OrchestraTopology implements Topology {
  private rows: Rows;

  constructor(config: { rows: Row[] }) {
    this.rows = new Rows({ rows: config.rows, location: 'orchestra' });
  }

  findSuitableSeats(search: Search) {
    return this.rows.findSuitableSeats(search);
  }
}
