import { ApiBalconyTopology, ApiTopology } from '../commons/types';

export const fetchOrchestraSeats = async (): Promise<ApiTopology> => {
  return { rows: [] };
};

export const fetchBalconySeats = async (): Promise<ApiBalconyTopology[]> => {
  return [];
};

export const fetchParterreSeats = async (): Promise<ApiTopology> => {
  return { rows: [] };
};
