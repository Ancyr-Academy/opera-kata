import { reserve } from './main';
import { print } from './logger';
import {
  fetchBalconySeats,
  fetchOrchestraSeats,
  fetchParterreSeats,
} from './api';
import { Mock } from 'vitest';
import { getDate } from './time';

// mocks are not a property of procedural programming because in procedural,
// all procedures are known at compile time. In this context, we would
// normally use preprocessor directives to pick between the real and the
// mocked implementation. But let's not be annoyed with such details.

vi.mock('./logger.ts', { spy: true });
vi.mock('./api.ts', { spy: true });
vi.mock('./time.ts', { spy: true });

// look what we've got to do to mimic a fraction of OO power

let printMock = print as Mock<typeof print>;
let fetchOrchestraSeatsMock = fetchOrchestraSeats as Mock<
  typeof fetchOrchestraSeats
>;
let fetchBalconySeatsMock = fetchBalconySeats as Mock<typeof fetchBalconySeats>;
let fetchParterreSeatsMock = fetchParterreSeats as Mock<
  typeof fetchParterreSeats
>;
let getDateMock = getDate as Mock<typeof getDate>;

const getLogCalls = () => printMock.mock.calls.join('\n').split('\n');

beforeEach(() => {
  // Interesting how, incidentally, we still use some OO
  printMock.mockReset();
  fetchOrchestraSeatsMock.mockReset();
  fetchBalconySeatsMock.mockReset();
  fetchParterreSeatsMock.mockReset();
  getDateMock.mockReset();
});

describe('orchestra', () => {
  const doReserve = (data?: { places?: number; backToFront?: boolean }) =>
    reserve({
      places: 1,
      location: 'Orchestra',
      lodgeOnly: false,
      backToFront: true,
      ...data,
    });

  test('no places available', async () => {
    await doReserve();
    expect(printMock).toHaveBeenCalledWith('No seats available');
  });

  test('fetching from orchestra API', async () => {
    await doReserve();
    expect(fetchOrchestraSeatsMock).toHaveBeenCalledOnce();
  });

  describe('reserving one seat', () => {
    test('when first seat is available, should reserve it', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      }));

      await doReserve();

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Orchestra, row 1, position 1');
    });

    test('when theres only one seat and its unavailable, should not reserve', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [{ position: 1, reserved: true }],
          },
        ],
      }));

      await doReserve();

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });

    test('the available seat is not the first one', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: true },
              { position: 2, reserved: false },
            ],
          },
        ],
      }));

      await doReserve();

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Orchestra, row 1, position 2');
      expect(logs.length).toBe(2); // ensure no other seats were reserved
    });

    test('reserving the first available seat, skipping others', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
            ],
          },
          {
            position: 2,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      }));

      await doReserve();

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Orchestra, row 1, position 1');
      expect(logs.length).toBe(2); // ensure no other seats were reserved
    });

    test('reserving front to back', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
            ],
          },
          {
            position: 2,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
            ],
          },
        ],
      }));

      await doReserve({ backToFront: false });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Orchestra, row 2, position 1');
      expect(logs.length).toBe(2); // ensure no other seats were reserved
    });
  });

  describe('reserving many seats', () => {
    test('should reserve contiguous seats', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
              { position: 3, reserved: false },
            ],
          },
        ],
      }));

      await doReserve({ places: 3 });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Orchestra, row 1, position 1');
      expect(logs[2]).toEqual('- Orchestra, row 1, position 2');
      expect(logs[3]).toEqual('- Orchestra, row 1, position 3');
    });

    test('should not reserve when the seats are non-contiguous', async () => {
      fetchOrchestraSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
            ],
          },
          {
            position: 2,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      }));

      await doReserve({ places: 3 });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });
  });
});

describe('parterre', () => {
  const doReserve = (places = 1) =>
    reserve({
      places,
      location: 'Parterre',
      lodgeOnly: false,
      backToFront: true,
    });

  test('no places available', async () => {
    await doReserve();
    expect(printMock).toHaveBeenCalledWith('No seats available');
  });

  test('fetching from Parterre API', async () => {
    await doReserve();
    expect(fetchParterreSeatsMock).toHaveBeenCalledOnce();
  });

  test('should reserve contiguous seats', async () => {
    fetchParterreSeatsMock.mockImplementationOnce(async () => ({
      rows: [
        {
          position: 1,
          seats: [
            { position: 1, reserved: false },
            { position: 2, reserved: false },
            { position: 3, reserved: false },
          ],
        },
      ],
    }));

    await doReserve(3);

    const logs = getLogCalls();
    expect(logs[0]).toEqual('Reserved Seat:');
    expect(logs[1]).toEqual('- Parterre, row 1, position 1');
    expect(logs[2]).toEqual('- Parterre, row 1, position 2');
    expect(logs[3]).toEqual('- Parterre, row 1, position 3');
  });

  describe('youth privatization', () => {
    // Between 21 June and 21 September, the Youth privatization program apply
    // hence, the first three rows of the parterre are considered not-reservable
    // even if they are not reserved

    beforeEach(() => {
      fetchParterreSeatsMock.mockImplementationOnce(async () => ({
        rows: [
          {
            position: 1,
            seats: [{ position: 1, reserved: false }],
          },
          {
            position: 2,
            seats: [{ position: 1, reserved: false }],
          },
          {
            position: 3,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      }));
    });

    test('does not apply the 20 june', async () => {
      getDateMock.mockImplementation(() => new Date('2021-06-20'));
      await doReserve(1);

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Parterre, row 1, position 1');
    });

    test('apply 21 june', async () => {
      getDateMock.mockImplementation(() => new Date('2021-06-21'));
      await doReserve(1);

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });

    test('apply 20 september', async () => {
      getDateMock.mockImplementation(() => new Date('2021-09-20'));
      await doReserve(1);

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });

    test('does not apply 21 september', async () => {
      getDateMock.mockImplementation(() => new Date('2021-09-21'));
      await doReserve(1);

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Parterre, row 1, position 1');
    });
  });
});

describe('balcony', () => {
  const vipRequiredLodgs = [
    {
      position: 10,
      seats: [],
    },
    {
      position: 11,
      seats: [],
    },
    {
      position: 12,
      seats: [],
    },
    {
      position: 13,
      seats: [],
    },
  ];

  const doReserve = (data: { places: number; lodgeOnly?: boolean }) =>
    reserve({
      location: 'Balcony',
      lodgeOnly: false,
      backToFront: true,
      ...data,
    });

  test('no places available', async () => {
    await doReserve({ places: 1 });
    expect(printMock).toHaveBeenCalledWith('No seats available');
  });

  test('fetching from Parterre API', async () => {
    await doReserve({ places: 1 });
    expect(fetchBalconySeatsMock).toHaveBeenCalledOnce();
  });

  test('should reserve contiguous seats in the parterre of the balcony', async () => {
    fetchBalconySeatsMock.mockImplementationOnce(async () => ({
      parterre: {
        rows: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
              { position: 3, reserved: false },
            ],
          },
        ],
      },
      lodges: [...vipRequiredLodgs],
    }));

    await doReserve({ places: 3 });

    const logs = getLogCalls();
    expect(logs[0]).toEqual('Reserved Seat:');
    expect(logs[1]).toEqual('- Balcony, row 1, position 1');
    expect(logs[2]).toEqual('- Balcony, row 1, position 2');
    expect(logs[3]).toEqual('- Balcony, row 1, position 3');
  });

  test('when the parterre is full, should fallback to the lodges', async () => {
    fetchBalconySeatsMock.mockImplementationOnce(async () => ({
      parterre: {
        rows: [],
      },
      lodges: [
        {
          position: 1,
          seats: [{ position: 1, reserved: false }],
        },
        {
          position: 2,
          seats: [],
        },
        ...vipRequiredLodgs,
      ],
    }));

    await doReserve({ places: 1 });

    const logs = getLogCalls();
    expect(logs[0]).toEqual('Reserved Seat:');
    expect(logs[1]).toEqual('- Lodge 1, position 1');
  });

  describe('reserving many seats', () => {
    test('all seats should belong to the same lodge', async () => {
      fetchBalconySeatsMock.mockImplementationOnce(async () => ({
        parterre: {
          rows: [],
        },
        lodges: [
          {
            position: 1,
            seats: [{ position: 1, reserved: false }],
          },
          {
            position: 2,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
              { position: 3, reserved: false },
            ],
          },
          ...vipRequiredLodgs,
        ],
      }));

      await doReserve({ places: 3 });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('Reserved Seat:');
      expect(logs[1]).toEqual('- Lodge 2, position 1');
      expect(logs[2]).toEqual('- Lodge 2, position 2');
      expect(logs[3]).toEqual('- Lodge 2, position 3');
    });

    test('can reserve more than 3 seats only in the parterre', async () => {
      fetchBalconySeatsMock.mockImplementationOnce(async () => ({
        parterre: {
          rows: [],
        },
        lodges: [
          {
            position: 1,
            seats: [
              { position: 1, reserved: false },
              { position: 2, reserved: false },
              { position: 3, reserved: false },
              { position: 4, reserved: false },
            ],
          },
          ...vipRequiredLodgs,
        ],
      }));

      await doReserve({ places: 4 });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });

    test('at least 4 lodges must remain unreserved', async () => {
      fetchBalconySeatsMock.mockImplementationOnce(async () => ({
        parterre: {
          rows: [],
        },
        lodges: [
          {
            position: 1,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      }));

      await doReserve({ places: 1 });

      const logs = getLogCalls();
      expect(logs[0]).toEqual('No seats available');
    });
  });

  test('lodge only', async () => {
    fetchBalconySeatsMock.mockImplementationOnce(async () => ({
      parterre: {
        rows: [
          {
            position: 1,
            seats: [{ position: 1, reserved: false }],
          },
        ],
      },
      lodges: [
        {
          position: 1,
          seats: [{ position: 1, reserved: false }],
        },
        ...vipRequiredLodgs,
      ],
    }));

    await doReserve({ places: 1, lodgeOnly: true });

    const logs = getLogCalls();
    expect(logs[0]).toEqual('Reserved Seat:');
    expect(logs[1]).toEqual('- Lodge 1, position 1');
  });
});
