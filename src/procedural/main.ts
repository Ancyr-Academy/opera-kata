/*
Procedural version.
Constraints :
- No type system excepts a very basic struct-like construction
- No dependency inversion and no pointer to functions
*/

import { print } from './logger';
import {
  fetchBalconySeats,
  fetchOrchestraSeats,
  fetchParterreSeats,
} from './api';
import { ApiBalconyTopology, ApiTopology } from '../commons/types';
import { getDate } from './time';

export type ReservationOrder = {
  places: number;
  location: string;
  lodgeOnly: boolean;
  backToFront: boolean;
};

export type ReservedSeat = {
  location: string;
  // either row or lodge can be set, not both
  row: number | null;
  lodge: number | null;
  position: number;
};

const MINIMUM_VIP_LODGES = 4;

export const reserve = async (order: ReservationOrder) => {
  let topology: ApiTopology;
  let balconyTopology: ApiBalconyTopology;

  if (order.location === 'Orchestra') {
    topology = await fetchOrchestraSeats();
  } else if (order.location === 'Parterre') {
    topology = await fetchParterreSeats();
  } else if (order.location === 'Balcony') {
    balconyTopology = await fetchBalconySeats();
    topology = balconyTopology.parterre;
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

  let shouldScanTopology = true;
  if (order.location === 'Balcony' && order.lodgeOnly) {
    shouldScanTopology = false;
  }

  if (shouldScanTopology) {
    if (order.backToFront) {
      for (const [index, row] of topology.rows.entries()) {
        if (isYouthProgramPeriod) {
          if (index < 3) {
            continue;
          }
        }

        for (const seat of row.seats) {
          if (!seat.reserved) {
            reservedSeats.push({
              location: order.location,
              row: row.position,
              lodge: null,
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

        reservedSeats = [];
      }
    } else {
      // Start from the last rows
      for (let i = topology.rows.length - 1; i >= 0; i--) {
        const row = topology.rows[i];

        if (isYouthProgramPeriod) {
          if (i < 3) {
            continue;
          }
        }

        for (const seat of row.seats) {
          if (!seat.reserved) {
            reservedSeats.push({
              location: order.location,
              row: row.position,
              lodge: null,
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

        reservedSeats = [];
      }
    }
  }

  if (reservedSeats.length === 0) {
    if (
      order.location === 'Balcony' &&
      order.places <= 3 &&
      balconyTopology!.lodges.length > MINIMUM_VIP_LODGES
    ) {
      // Try to find in the lodges
      for (const lodge of balconyTopology!.lodges) {
        for (const seat of lodge.seats) {
          if (!seat.reserved) {
            reservedSeats.push({
              location: order.location,
              row: null,
              lodge: lodge.position,
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

        reservedSeats = [];
      }
    }
  }

  if (reservedSeats.length === 0) {
    print('No seats available');
  } else {
    print('Reserved Seat:');

    for (const seat of reservedSeats) {
      if (seat.lodge !== null) {
        print(`- Lodge ${seat.lodge}, position ${seat.position}`);
      } else {
        print(`- ${seat.location}, row ${seat.row}, position ${seat.position}`);
      }
    }
  }

  return true;
};
