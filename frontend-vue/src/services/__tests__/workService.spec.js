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

  it('createWork envía POST /works con los datos de la obra', async () => {
    const payload = {
      title: 'Oppenheimer',
      type: 'movie',
      genre: 'Drama',
      release_year: 2023,
      duration: '180 min',
      synopsis: 'Biografía del creador de la bomba atómica.'
    };
    const mockCreated = {
      message: 'Obra creada correctamente.',
      work: { id: 'w-opp', ...payload }
    };
    vi.spyOn(api, 'post').mockResolvedValue({ data: mockCreated });

    const result = await workService.createWork(payload);

    expect(api.post).toHaveBeenCalledWith('/works', payload);
    expect(result).toEqual(mockCreated);
  });

  it('updateWork envía PUT /works/:id con los datos modificados', async () => {
    const payload = { title: 'Oppenheimer (Extended)' };
    const mockUpdated = {
      message: 'Obra actualizada correctamente.',
      work: { id: 'w-opp', title: 'Oppenheimer (Extended)' }
    };
    vi.spyOn(api, 'put').mockResolvedValue({ data: mockUpdated });

    const result = await workService.updateWork('w-opp', payload);

    expect(api.put).toHaveBeenCalledWith('/works/w-opp', payload);
    expect(result).toEqual(mockUpdated);
  });

  it('deleteWork envía DELETE /works/:id', async () => {
    const mockDeleted = { message: 'Obra eliminada correctamente.' };
    vi.spyOn(api, 'delete').mockResolvedValue({ data: mockDeleted });

    const result = await workService.deleteWork('w-opp');

    expect(api.delete).toHaveBeenCalledWith('/works/w-opp');
    expect(result).toEqual(mockDeleted);
  });
});
