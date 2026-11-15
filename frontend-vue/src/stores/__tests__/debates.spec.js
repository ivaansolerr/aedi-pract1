import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDebatesStore } from '../debates';
import debateService from '../../services/debateService';

describe('useDebatesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('inicializa con valores por defecto', () => {
    const store = useDebatesStore();
    expect(store.debates).toEqual([]);
    expect(store.pagination).toEqual({ total: 0, page: 1, limit: 5, totalPages: 1 });
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBeNull();
  });

  it('fetchDebatesForWork consulta y almacena los debates de la obra', async () => {
    const mockData = {
      debates: [{ id: 'd1', title: 'Debate 1', description: 'Desc 1' }],
      pagination: { total: 1, page: 1, limit: 5, totalPages: 1 }
    };
    vi.spyOn(debateService, 'getDebatesByWork').mockResolvedValue(mockData);

    const store = useDebatesStore();
    const result = await store.fetchDebatesForWork({ workId: 'w1', page: 1 });

    expect(result).toEqual(mockData);
    expect(store.debates).toHaveLength(1);
    expect(store.debates[0].title).toBe('Debate 1');
    expect(store.pagination.total).toBe(1);
  });

  it('createDebate registra el debate y recarga la lista', async () => {
    const payload = { title: 'Nuevo Debate', description: 'Nueva Descripcion' };
    vi.spyOn(debateService, 'createDebateForWork').mockResolvedValue({
      debate: { id: 'd-created', ...payload }
    });
    const fetchSpy = vi.spyOn(debateService, 'getDebatesByWork').mockResolvedValue({
      debates: [{ id: 'd-created', ...payload }],
      pagination: { total: 1, page: 1, limit: 5, totalPages: 1 }
    });

    const store = useDebatesStore();
    const result = await store.createDebate('w1', payload);

    expect(result.id).toBe('d-created');
    expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ workId: 'w1', page: 1 }));
  });

  it('deleteDebate elimina el debate y sincroniza el listado', async () => {
    vi.spyOn(debateService, 'deleteDebate').mockResolvedValue({ message: 'OK' });
    vi.spyOn(debateService, 'getDebatesByWork').mockResolvedValue({
      debates: [],
      pagination: { total: 0, page: 1, limit: 5, totalPages: 1 }
    });

    const store = useDebatesStore();
    store.debates = [{ id: 'd-to-del', title: 'Debate' }];
    store.pagination.total = 1;

    await store.deleteDebate('d-to-del', 'w1');

    expect(store.debates).toHaveLength(0);
    expect(store.pagination.total).toBe(0);
  });

  it('setPage actualiza la página y consulta el servicio', async () => {
    const fetchSpy = vi.spyOn(debateService, 'getDebatesByWork').mockResolvedValue({
      debates: [{ id: 'd2', title: 'Debate pag 2' }],
      pagination: { total: 8, page: 2, limit: 5, totalPages: 2 }
    });

    const store = useDebatesStore();
    await store.setPage('w1', 2);

    expect(store.pagination.page).toBe(2);
    expect(fetchSpy).toHaveBeenCalledWith(expect.objectContaining({ workId: 'w1', page: 2 }));
  });
});

