import { ApiBalconyTopology, ApiTopology } from '../commons/types';

export const fetchOrchestraSeats = async (): Promise<ApiTopology> => {
  return { rows: [] };
};

export const fetchBalconySeats = async (): Promise<ApiBalconyTopology> => {
  return { parterre: { rows: [] }, lodges: [] };
};

export const fetchParterreSeats = async (): Promise<ApiTopology> => {
  return { rows: [] };
};
