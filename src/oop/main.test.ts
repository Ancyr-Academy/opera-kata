import { NoSeatTicket } from './no-seat-ticket';
import { ReservationTicket } from './reservation-ticket';
import { Seat } from './organization/seat';
import { ReservationService } from './reservation-service';
import { Row } from './organization/row';
import { OrchestraTopology } from './topology/orchestra-topology';
import { ParterreTopology } from './topology/parterre-topology';
import { BalconyTopology } from './topology/balcony-topology';
import { Lodge } from './organization/lodge';

export const createSUT = (config?: {
  rows?: Row[];
  topology?: OrchestraTopology | ParterreTopology | BalconyTopology;
}) => {
  const service = new ReservationService();
  if (config?.topology) {
    service.setTopology(config.topology);
  }

  return { service };
};

const row = (position: number, seats: Seat[]) => new Row({ position, seats });
const availableSeat = (position: number) =>
  new Seat({ available: true, position });
const unavailableSeat = (position: number) =>
  new Seat({ available: false, position });
const lodge = (position: number, seats: Seat[]) =>
  new Lodge({ position, seats });

describe('orchestra', () => {
  test('no seat available', () => {
    const expectedTicket = new NoSeatTicket();

    const { service } = createSUT();
    const ticket = service.reserve({
      places: 0,
      location: 'orchestra',
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('reserves first seat', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'orchestra',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'orchestra', row: 1, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('skip unavailable seat, reserve first available seat', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, [unavailableSeat(1), availableSeat(2)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'orchestra',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'orchestra', row: 1, position: 2 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('reserve many seats', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, [availableSeat(1), availableSeat(2)])],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'orchestra',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'orchestra', row: 1, position: 1 },
        { location: 'orchestra', row: 1, position: 2 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('reserve contiguous seats', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [
          row(1, [
            availableSeat(1),
            unavailableSeat(2),
            availableSeat(3),
            availableSeat(4),
          ]),
        ],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'orchestra',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'orchestra', row: 1, position: 3 },
        { location: 'orchestra', row: 1, position: 4 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('fails if no contiguous seats', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [
          row(1, [
            availableSeat(1),
            unavailableSeat(2),
            availableSeat(3),
            unavailableSeat(4),
          ]),
        ],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'orchestra',
    });

    const expectedTicket = new NoSeatTicket();
    expect(ticket).toEqual(expectedTicket);
  });

  test('fails if two contiguous seat in different rows', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, [availableSeat(1)]), row(2, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'orchestra',
    });

    const expectedTicket = new NoSeatTicket();
    expect(ticket).toEqual(expectedTicket);
  });

  test('find seats on the second row', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, []), row(2, [availableSeat(1), availableSeat(2)])],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'orchestra',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'orchestra', row: 2, position: 1 },
        { location: 'orchestra', row: 2, position: 2 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('find seats front to back', () => {
    const { service } = createSUT({
      topology: new OrchestraTopology({
        rows: [row(1, [availableSeat(1)]), row(2, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'orchestra',
      searchPreference: 'front-to-back',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'orchestra', row: 2, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });
});

describe('parterre', () => {
  test('no seat available', () => {
    const { service } = createSUT();
    const ticket = service.reserve({
      places: 0,
      location: 'parterre',
    });

    const expectedTicket = new NoSeatTicket();
    expect(ticket).toEqual(expectedTicket);
  });

  test('reserves first seat', () => {
    const { service } = createSUT({
      topology: new ParterreTopology({
        rows: [row(1, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'parterre',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'parterre', row: 1, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('find seats front to back', () => {
    const { service } = createSUT({
      topology: new ParterreTopology({
        rows: [row(1, [availableSeat(1)]), row(2, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'parterre',
      searchPreference: 'front-to-back',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'parterre', row: 2, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });
});

describe('balcony', () => {
  test('no seat available', () => {
    const { service } = createSUT();
    const ticket = service.reserve({
      places: 0,
      location: 'balcony',
    });

    const expectedTicket = new NoSeatTicket();
    expect(ticket).toEqual(expectedTicket);
  });

  test('reserve first seat in the parterre of the balcony', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [],
        balconyRows: [row(1, [availableSeat(1)])],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'balcony',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'balcony', row: 1, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('reserve the first available seat in the lodge of the balcony', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [lodge(1, [availableSeat(1)])],
        balconyRows: [],
      }),
    });

    const ticket = service.reserve({
      places: 1,
      location: 'balcony',
    });

    const expectedTicket = new ReservationTicket({
      places: 1,
      seats: [{ location: 'balcony', lodge: 1, position: 1 }],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('reserve many lodge seats', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [lodge(1, [availableSeat(1), availableSeat(2)])],
        balconyRows: [],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'balcony',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'balcony', lodge: 1, position: 1 },
        { location: 'balcony', lodge: 1, position: 2 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('does not reserve any seats if not enough lodge seats are available', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [lodge(1, [availableSeat(1)])],
        balconyRows: [],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'balcony',
    });

    const expectedTicket = new NoSeatTicket();
    expect(ticket).toEqual(expectedTicket);
  });

  test('reserves the first seats available', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [
          lodge(1, [availableSeat(1), availableSeat(2), availableSeat(3)]),
        ],
        balconyRows: [],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'balcony',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'balcony', lodge: 1, position: 1 },
        { location: 'balcony', lodge: 1, position: 2 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });

  test('skip seats if they are not contiguous', () => {
    const { service } = createSUT({
      topology: new BalconyTopology({
        lodges: [
          lodge(1, [
            availableSeat(1),
            unavailableSeat(2),
            availableSeat(3),
            availableSeat(4),
          ]),
        ],
        balconyRows: [],
      }),
    });

    const ticket = service.reserve({
      places: 2,
      location: 'balcony',
    });

    const expectedTicket = new ReservationTicket({
      places: 2,
      seats: [
        { location: 'balcony', lodge: 1, position: 3 },
        { location: 'balcony', lodge: 1, position: 4 },
      ],
    });

    expect(ticket).toEqual(expectedTicket);
  });
});
