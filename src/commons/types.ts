export type ApiTopology = {
  rows: Array<{
    position: number;
    seats: Array<{
      position: number;
      reserved: boolean;
    }>;
  }>;
};

export type ApiBalconyTopology = {
  parterre: ApiTopology;
  lodges: Array<{
    position: number;
    seats: Array<{
      position: number;
      reserved: boolean;
    }>;
  }>;
};
