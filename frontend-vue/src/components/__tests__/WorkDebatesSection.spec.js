import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import WorkDebatesSection from '../WorkDebatesSection.vue';
import { useAuthStore } from '../../stores/auth';
import { useDebatesStore } from '../../stores/debates';
import debateService from '../../services/debateService';

describe('WorkDebatesSection.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    vi.spyOn(debateService, 'getDebatesByWork').mockResolvedValue({
      debates: [],
      pagination: { total: 0, page: 1, limit: 5, totalPages: 1 }
    });
  });

  const createWrapper = () => {
    return mount(WorkDebatesSection, {
      props: { workId: 'w-test-123' },
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
          InputText: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Textarea: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Button: {
            props: ['label'],
            template: '<button @click="$emit(\'click\')">{{ label }}</button>'
          },
          Message: {
            template: '<div class="p-message"><slot></slot></div>'
          },
          ProgressSpinner: {
            template: '<div class="spinner">Cargando...</div>'
          },
          Paginator: {
            props: ['totalRecords'],
            template: '<div class="paginator">{{ totalRecords }}</div>'
          },
          'router-link': {
            props: ['to'],
            template: '<a :href="to"><slot></slot></a>'
          },
          DebateCard: {
            props: ['debate'],
            template: '<div class="debate-stub">{{ debate.title }}</div>'
          }
        }
      }
    });
  };

  it('muestra el formulario de creación de debate cuando el usuario está autenticado', () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-active';
    authStore.user = { id: 'u1', username: 'Ana' };

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Iniciar un nuevo debate');
    expect(wrapper.text()).toContain('Publicar Debate');
    expect(wrapper.text()).not.toContain('Inicia sesión con tu cuenta para participar');
  });

  it('valida que el título y la descripción no estén vacíos al enviar el formulario', async () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-active';
    authStore.user = { id: 'u1' };

    const wrapper = createWrapper();
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('El título del debate es obligatorio.');
    expect(wrapper.text()).toContain('La descripción es obligatoria.');
  });

  it('muestra el mensaje de inicio de sesión para visitantes', () => {
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Inicia sesión con tu cuenta para participar');
    expect(wrapper.text()).not.toContain('Publicar Debate');
  });

  it('muestra el estado vacío cuando la obra no tiene debates abiertos', () => {
    const debatesStore = useDebatesStore();
    debatesStore.debates = [];
    debatesStore.isLoading = false;

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('No hay debates abiertos todavía');
    expect(wrapper.text()).toContain('¡Sé el primero en iniciar un debate!');
  });
});

