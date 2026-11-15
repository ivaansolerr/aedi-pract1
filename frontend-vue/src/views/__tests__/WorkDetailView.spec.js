import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import WorkDetailView from '../WorkDetailView.vue';
import { useWorksStore } from '../../stores/works';
import { useAuthStore } from '../../stores/auth';
import workService from '../../services/workService';

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: 'w-detail-1' } }),
  useRouter: () => ({ push: vi.fn() })
}));

describe('WorkDetailView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  const mockWork = {
    id: 'w-detail-1',
    title: 'Interstellar',
    type: 'movie',
    genre: 'Ciencia Ficción',
    release_year: 2014,
    duration: '169 min',
    synopsis: 'Un grupo de exploradores viaja a través de un agujero de gusano en el espacio.'
  };

  const createWrapper = () => {
    return mount(WorkDetailView, {
      global: {
        plugins: [PrimeVue, ToastService, ConfirmationService],
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <slot name="title"></slot>
                <slot name="content"></slot>
              </div>
            `
          },
          Tag: {
            props: ['value'],
            template: '<span class="p-tag">{{ value }}</span>'
          },
          Button: {
            props: ['label'],
            template: '<button @click="$emit(\'click\')">{{ label }}</button>'
          },
          ProgressSpinner: {
            template: '<div class="spinner">Cargando...</div>'
          },
          'router-link': {
            props: ['to'],
            template: '<a :href="to"><slot></slot></a>'
          },
          WorkDebatesSection: {
            template: '<div class="debates-stub">Debates</div>'
          }
        }
      }
    });
  };

  it('renderiza la información completa de la ficha técnica de la obra', async () => {
    vi.spyOn(workService, 'getWorkById').mockResolvedValue({ work: mockWork });
    const worksStore = useWorksStore();
    worksStore.currentWork = mockWork;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Interstellar');
    expect(wrapper.text()).toContain('Película');
    expect(wrapper.text()).toContain('Ciencia Ficción');
    expect(wrapper.text()).toContain('2014');
    expect(wrapper.text()).toContain('169 min');
    expect(wrapper.text()).toContain('Un grupo de exploradores viaja');
  });

  it('oculta los botones de editar y eliminar a usuarios no autenticados', async () => {
    vi.spyOn(workService, 'getWorkById').mockResolvedValue({ work: mockWork });
    const worksStore = useWorksStore();
    worksStore.currentWork = mockWork;

    const authStore = useAuthStore();
    authStore.token = null;

    const wrapper = createWrapper();

    expect(wrapper.text()).not.toContain('Editar obra');
    expect(wrapper.text()).not.toContain('Eliminar obra');
  });

  it('muestra los botones de editar y eliminar a miembros autenticados', async () => {
    vi.spyOn(workService, 'getWorkById').mockResolvedValue({ work: mockWork });
    const worksStore = useWorksStore();
    worksStore.currentWork = mockWork;

    const authStore = useAuthStore();
    authStore.token = 'jwt-member-token';

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Editar obra');
    expect(wrapper.text()).toContain('Eliminar obra');
  });

  it('muestra estado de no encontrada cuando la obra no existe', async () => {
    vi.spyOn(workService, 'getWorkById').mockRejectedValue(new Error('404'));
    const worksStore = useWorksStore();
    worksStore.currentWork = null;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Obra no encontrada');
    expect(wrapper.text()).toContain('Volver al catálogo');
  });
});
