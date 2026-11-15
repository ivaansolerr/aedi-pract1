import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useWorksStore } from '../works';
import workService from '../../services/workService';

describe('useWorksStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('inicializa con valores por defecto y lista vacía', () => {
    const store = useWorksStore();
    expect(store.works).toEqual([]);
    expect(store.currentWork).toBeNull();
    expect(store.pagination).toEqual({ total: 0, page: 1, limit: 6, totalPages: 1 });
    expect(store.filters).toEqual({ title: '', type: '', genre: '', release_year: '' });
    expect(store.isLoading).toBe(false);
    expect(store.isLoadingDetail).toBe(false);
    expect(store.errorMessage).toBeNull();
  });

  it('fetchWorks carga obras y actualiza la paginación con éxito', async () => {
    const mockData = {
      works: [
        { id: 'w1', title: 'Blade Runner', type: 'movie' },
        { id: 'w2', title: 'Dune', type: 'book' }
      ],
      pagination: { total: 2, page: 1, limit: 6, totalPages: 1 }
    };
    vi.spyOn(workService, 'getWorks').mockResolvedValue(mockData);

    const store = useWorksStore();
    const result = await store.fetchWorks();

    expect(result).toEqual(mockData);
    expect(store.works).toHaveLength(2);
    expect(store.pagination.total).toBe(2);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBeNull();
  });

  it('fetchWorkById obtiene los detalles y actualiza currentWork', async () => {
    const mockWork = { id: 'w1', title: 'Blade Runner', type: 'movie' };
    vi.spyOn(workService, 'getWorkById').mockResolvedValue({ work: mockWork });

    const store = useWorksStore();
    const result = await store.fetchWorkById('w1');

    expect(result).toEqual(mockWork);
    expect(store.currentWork).toEqual(mockWork);
    expect(store.isLoadingDetail).toBe(false);
  });

  it('createWork registra una nueva obra mediante el servicio', async () => {
    const payload = { title: 'Tenet', type: 'movie' };
    const mockCreated = { id: 'w-new', ...payload };
    vi.spyOn(workService, 'createWork').mockResolvedValue({ work: mockCreated });

    const store = useWorksStore();
    const result = await store.createWork(payload);

    expect(result).toEqual(mockCreated);
    expect(store.isLoading).toBe(false);
  });

  it('updateWork modifica los datos y actualiza currentWork', async () => {
    const payload = { title: 'Tenet (Director Cut)' };
    const mockUpdated = { id: 'w-new', title: 'Tenet (Director Cut)' };
    vi.spyOn(workService, 'updateWork').mockResolvedValue({ work: mockUpdated });

    const store = useWorksStore();
    store.currentWork = { id: 'w-new', title: 'Tenet' };

    const result = await store.updateWork('w-new', payload);

    expect(result).toEqual(mockUpdated);
    expect(store.currentWork.title).toBe('Tenet (Director Cut)');
  });

  it('deleteWork elimina la obra de la lista y limpia currentWork', async () => {
    vi.spyOn(workService, 'deleteWork').mockResolvedValue({ message: 'Obra eliminada' });

    const store = useWorksStore();
    store.works = [{ id: 'w-del', title: 'Por eliminar' }];
    store.currentWork = { id: 'w-del', title: 'Por eliminar' };

    await store.deleteWork('w-del');

    expect(store.works).toHaveLength(0);
    expect(store.currentWork).toBeNull();
  });

  it('setPage actualiza la página y consulta el servicio', async () => {
    const mockData = {
      works: [{ id: 'w3', title: 'Interestelar', type: 'movie' }],
      pagination: { total: 10, page: 2, limit: 6, totalPages: 2 }
    };
    const spy = vi.spyOn(workService, 'getWorks').mockResolvedValue(mockData);

    const store = useWorksStore();
    await store.setPage(2);

    expect(store.pagination.page).toBe(2);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    expect(store.works[0].title).toBe('Interestelar');
  });

  it('setFilters aplica nuevos filtros y reinicia la página a 1', async () => {
    const mockData = {
      works: [{ id: 'w4', title: 'Foundation', type: 'series' }],
      pagination: { total: 1, page: 1, limit: 6, totalPages: 1 }
    };
    const spy = vi.spyOn(workService, 'getWorks').mockResolvedValue(mockData);

    const store = useWorksStore();
    store.pagination.page = 3;

    await store.setFilters({ title: 'Foundation', type: 'series' });

    expect(store.pagination.page).toBe(1);
    expect(store.filters.title).toBe('Foundation');
    expect(store.filters.type).toBe('series');
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Foundation',
        type: 'series',
        page: 1
      })
    );
  });

  it('resetFilters limpia los filtros y reinicia la página a 1', async () => {
    const mockData = {
      works: [],
      pagination: { total: 0, page: 1, limit: 6, totalPages: 1 }
    };
    const spy = vi.spyOn(workService, 'getWorks').mockResolvedValue(mockData);

    const store = useWorksStore();
    store.filters.title = 'Búsqueda previa';
    store.pagination.page = 4;

    await store.resetFilters();

    expect(store.filters).toEqual({ title: '', type: '', genre: '', release_year: '' });
    expect(store.pagination.page).toBe(1);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ page: 1, title: '' }));
  });

  it('fetchWorks captura errores y vacía la lista de obras', async () => {
    vi.spyOn(workService, 'getWorks').mockRejectedValue({
      response: { data: { message: 'Fallo de conexión con la base de datos' } }
    });

    const store = useWorksStore();
    await expect(store.fetchWorks()).rejects.toBeDefined();

    expect(store.works).toEqual([]);
    expect(store.errorMessage).toBe('Fallo de conexión con la base de datos');
    expect(store.isLoading).toBe(false);
  });
});
