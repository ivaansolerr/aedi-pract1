import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import workService from '../workService';

describe('workService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getWorks llama a GET /works con parámetros limpios', async () => {
    const mockResponse = {
      works: [{ id: 'w1', title: 'El Señor de los Anillos' }],
      pagination: { total: 1, page: 1, limit: 6, totalPages: 1 }
    };
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockResponse });

    const result = await workService.getWorks({
      title: 'Señor',
      type: 'book',
      genre: '',
      release_year: undefined,
      page: 1,
      limit: 6
    });

    expect(api.get).toHaveBeenCalledWith('/works', {
      params: {
        title: 'Señor',
        type: 'book',
        page: 1,
        limit: 6
      }
    });
    expect(result).toEqual(mockResponse);
  });

  it('getWorkById llama a GET /works/:id', async () => {
    const mockWork = {
      work: { id: 'w1', title: 'Inception' }
    };
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockWork });

    const result = await workService.getWorkById('w1');

    expect(api.get).toHaveBeenCalledWith('/works/w1');
    expect(result).toEqual(mockWork);
  });
});

