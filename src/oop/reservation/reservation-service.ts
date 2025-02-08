import { NoSeatTicket } from './no-seat-ticket';
import { ReservationTicket } from './reservation-ticket';
import { Location, SearchPreference } from '../organization/types';
import { Topology } from './topology';

export class ReservationService {
  private topology: Topology | null = null;

  reserve(order: {
    places: number;
    location: Location;
    lodgeOnly?: boolean;
    searchPreference?: SearchPreference;
  }) {
    const result = this.topology!.findSuitableSeats({
      quantity: order.places,
      searchPreference: order.searchPreference,
      lodgeOnly: order.lodgeOnly,
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
