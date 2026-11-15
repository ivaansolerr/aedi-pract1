import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import WorksListView from '../WorksListView.vue';
import { useWorksStore } from '../../stores/works';
import workService from '../../services/workService';

describe('WorksListView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    vi.spyOn(workService, 'getWorks').mockResolvedValue({
      works: [],
      pagination: { total: 0, page: 1, limit: 6, totalPages: 1 }
    });
  });

  const createWrapper = () => {
    return mount(WorksListView, {
      global: {
        stubs: {
          WorksFilterBar: {
            template: '<div class="filter-bar-stub"></div>'
          },
          WorkCard: {
            props: ['work'],
            template: '<div class="work-card-stub">{{ work.title }}</div>'
          },
          ProgressSpinner: {
            template: '<div class="spinner-stub">Cargando...</div>'
          },
          Paginator: {
            props: ['totalRecords', 'rows', 'first'],
            emits: ['page'],
            template: `
              <div class="paginator-stub" :data-total="totalRecords">
                <button class="next-page-btn" @click="$emit('page', { page: 1 })">Página 2</button>
              </div>
            `
          },
          Message: {
            template: '<div class="p-message"><slot></slot></div>'
          },
          Button: {
            props: ['label'],
            template: '<button @click="$emit(\'click\')">{{ label }}</button>'
          }
        }
      }
    });
  };

  it('renderiza la lista de obras cuando existen registros en el store', () => {
    const store = useWorksStore();
    store.works = [
      { id: '1', title: 'Dune' },
      { id: '2', title: 'Solaris' }
    ];
    store.pagination.total = 2;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Catálogo de Obras');
    expect(wrapper.text()).toContain('2 obras encontradas');
    expect(wrapper.findAll('.work-card-stub')).toHaveLength(2);
    expect(wrapper.text()).toContain('Dune');
    expect(wrapper.text()).toContain('Solaris');
  });

  it('muestra el spinner de carga mientras se obtienen las obras', () => {
    const store = useWorksStore();
    store.isLoading = true;

    const wrapper = createWrapper();

    expect(wrapper.find('.spinner-stub').exists()).toBe(true);
    expect(wrapper.text()).toContain('Cargando catálogo de obras...');
    expect(wrapper.find('.works-grid').exists()).toBe(false);
  });

  it('muestra el estado vacío cuando no hay obras coincidentes', () => {
    const store = useWorksStore();
    store.works = [];
    store.isLoading = false;
    store.pagination.total = 0;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('No se encontraron obras');
    expect(wrapper.text()).toContain('Limpiar filtros');
  });

  it('renderiza el paginador cuando el total supera el límite por página', () => {
    const store = useWorksStore();
    store.works = [{ id: '1', title: 'Obra 1' }];
    store.pagination = { total: 12, page: 1, limit: 6, totalPages: 2 };

    const wrapper = createWrapper();

    expect(wrapper.find('.paginator-stub').exists()).toBe(true);
    expect(wrapper.find('.paginator-stub').attributes('data-total')).toBe('12');
  });

  it('avanzar de página en el paginador invoca setPage en el store', async () => {
    const store = useWorksStore();
    store.works = [{ id: '1', title: 'Obra 1' }];
    store.pagination = { total: 12, page: 1, limit: 6, totalPages: 2 };
    const setPageSpy = vi.spyOn(store, 'setPage').mockResolvedValue({});

    // Mock scrollTo
    window.scrollTo = vi.fn();

    const wrapper = createWrapper();
    await wrapper.find('.next-page-btn').trigger('click');

    expect(setPageSpy).toHaveBeenCalledWith(2);
  });
});
