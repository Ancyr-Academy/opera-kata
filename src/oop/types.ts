export type SearchPreference = 'front-to-back' | 'back-to-front';
export type Location = 'orchestra' | 'parterre' | 'balcony';
export type ReservableSeat =
  | {
      location: Location;
      row: number;
      position: number;
    }
  | {
      location: 'balcony';
      lodge: number;
      position: number;
    };

export type Search = {
  quantity: number;
  searchPreference?: SearchPreference;
};
