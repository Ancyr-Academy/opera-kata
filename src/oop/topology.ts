import { ReservableSeat, Search } from './types';

export interface Topology {
  findSuitableSeats(search: Search): ReservableSeat[] | null;
}
