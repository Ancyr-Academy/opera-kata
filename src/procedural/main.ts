/*
Procedural version.
Constraints :
- No type system excepts a very basic struct-like construction
- No dependency inversion and no pointer to functions
*/

import { print } from './logger';
import { fetchOrchestraSeats, fetchParterreSeats } from './api';
import { ApiTopology } from '../commons/types';
import { getDate } from './time';

export type ReservationOrder = {
  places: number;
  location: string;
  withLodge: boolean;
  fullLodge: boolean;
  orchestraOrBalconyPreference: null | string;
};

export type ReservedSeat = {
  id: string;
  location: string;
  row: number;
  position: number;
};

export const reserve = async (order: ReservationOrder) => {
  let topology: ApiTopology;
  if (order.location === 'Orchestra') {
    topology = await fetchOrchestraSeats();
  } else if (order.location === 'Parterre') {
    topology = await fetchParterreSeats();
  } else {
    throw new Error('Invalid location');
  }

  let reservedSeats: ReservedSeat[] = [];
  let isYouthProgramPeriod = false;

  if (order.location === 'Parterre') {
    const date = getDate();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    if (month >= 6 && month <= 9) {
      if (month === 6 && day >= 21) {
        isYouthProgramPeriod = true;
      } else if (month === 9 && day < 21) {
        isYouthProgramPeriod = true;
      }
    }
  }

  for (const [index, row] of topology.rows.entries()) {
    if (isYouthProgramPeriod) {
      if (index < 3) {
        continue;
      }
    }

    for (const seat of row.seats) {
      if (!seat.reserved) {
        reservedSeats.push({
          id: '1',
          location: order.location,
          row: row.position,
          position: seat.position,
        });

        if (reservedSeats.length === order.places) {
          break;
        }
      }
    }

    if (reservedSeats.length === order.places) {
      break;
    }

    if (reservedSeats.length < order.places) {
      reservedSeats = [];
    }
  }

  if (reservedSeats.length === 0) {
    print('No seats available');
  } else {
    print('Reserved Seat:');

    for (const seat of reservedSeats) {
      print(`- ${seat.location}, row ${seat.row}, position ${seat.position}`);
    }
  }

  return true;
};
