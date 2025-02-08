import { ReservableSeat } from './types';

export class ReservationTicket {
  private places: number = 0;
  private seats: ReservableSeat[] = [];

  constructor(config: { places: number; seats: ReservableSeat[] }) {
    this.places = config.places;
    this.seats = config.seats;
  }
}
