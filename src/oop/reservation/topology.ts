import { ReservableSeat, Search } from '../organization/types';

export interface Topology {
  findSuitableSeats(search: Search): ReservableSeat[] | null;
}
