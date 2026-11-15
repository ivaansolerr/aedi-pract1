import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import debateService from '../debateService';

describe('debateService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('getDebatesByWork realiza GET /debates con work_id y paginación', async () => {
    const mockData = {
      debates: [{ id: 'd1', title: 'Teorías sobre el final' }],
      pagination: { total: 1, page: 1, limit: 5, totalPages: 1 }
    };
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockData });

    const result = await debateService.getDebatesByWork({
      workId: 'w-1',
      page: 2,
      limit: 5
    });

    expect(api.get).toHaveBeenCalledWith('/debates', {
      params: { work_id: 'w-1', page: 2, limit: 5 }
    });
    expect(result).toEqual(mockData);
  });

  it('createDebateForWork realiza POST /works/:workId/debates', async () => {
    const payload = {
      title: 'El significado de la biblioteca',
      description: 'Una interpretación del tramo final de la obra.'
    };
    const mockCreated = {
      message: 'Debate creado correctamente.',
      debate: { id: 'd-new', ...payload }
    };
    vi.spyOn(api, 'post').mockResolvedValue({ data: mockCreated });

    const result = await debateService.createDebateForWork('w-1', payload);

    expect(api.post).toHaveBeenCalledWith('/works/w-1/debates', payload);
    expect(result).toEqual(mockCreated);
  });

  it('deleteDebate realiza DELETE /debates/:id', async () => {
    const mockResponse = { message: 'Debate eliminado correctamente.' };
    vi.spyOn(api, 'delete').mockResolvedValue({ data: mockResponse });

    const result = await debateService.deleteDebate('d-del');

    expect(api.delete).toHaveBeenCalledWith('/debates/d-del');
    expect(result).toEqual(mockResponse);
  });
});

