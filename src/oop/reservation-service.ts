import { NoSeatTicket } from './no-seat-ticket';
import { ReservationTicket } from './reservation-ticket';
import { OrchestraTopology } from './topology/orchestra-topology';
import { Location, SearchPreference } from './types';
import { Topology } from './topology';

export class ReservationService {
  private topology: Topology = new OrchestraTopology({ rows: [] });

  reserve(order: {
    places: number;
    location: Location;
    searchPreference?: SearchPreference;
  }) {
    const result = this.topology.findSuitableSeats({
      quantity: order.places,
      searchPreference: order.searchPreference,
    });

    if (result === null) {
      return new NoSeatTicket();
    }

    return new ReservationTicket({
      places: order.places,
      seats: result,
    });
  }

  setTopology(topology: Topology) {
    this.topology = topology;
  }
}
