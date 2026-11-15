import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import WorkFormView from '../WorkFormView.vue';
import workService from '../../services/workService';

let currentRouteParams = {};

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: currentRouteParams }),
  useRouter: () => ({ push: vi.fn() })
}));

describe('WorkFormView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
    currentRouteParams = {};
  });

  const createWrapper = () => {
    return mount(WorkFormView, {
      global: {
        plugins: [PrimeVue, ToastService],
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
          Select: {
            props: ['modelValue', 'options'],
            emits: ['update:modelValue'],
            template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option></select>'
          },
          Textarea: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Button: {
            props: ['label'],
            template: '<button>{{ label }}</button>'
          },
          Message: {
            template: '<div class="p-message"><slot></slot></div>'
          }
        }
      }
    });
  };

  it('renderiza el formulario en modo creación por defecto', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Registrar Nueva Obra');
    expect(wrapper.text()).toContain('Crear Obra');
  });

  it('muestra mensajes de validación al enviar campos requeridos vacíos', async () => {
    const wrapper = createWrapper();
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('El título de la obra es obligatorio.');
    expect(wrapper.text()).toContain('El género es obligatorio.');
    expect(wrapper.text()).toContain('El año de lanzamiento es obligatorio.');
    expect(wrapper.text()).toContain('La duración o extensión es obligatoria');
    expect(wrapper.text()).toContain('La sinopsis es obligatoria.');
  });

  it('pre-rellena el formulario en modo edición cuando existe id en la ruta', async () => {
    currentRouteParams = { id: 'w-edit-99' };
    const mockExisting = {
      id: 'w-edit-99',
      title: 'Dune: Parte Dos',
      type: 'movie',
      genre: 'Ciencia Ficción',
      release_year: 2024,
      duration: '166 min',
      synopsis: 'Paul Atreides se une a los Fremen para iniciar la rebelión.'
    };
    vi.spyOn(workService, 'getWorkById').mockResolvedValue({ work: mockExisting });

    const wrapper = createWrapper();

    // Esperar a que se resuelva onMounted
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Editar Obra');
      expect(wrapper.text()).toContain('Guardar Cambios');
      const titleInput = wrapper.find('input');
      expect(titleInput.element.value).toBe('Dune: Parte Dos');
    });
  });
});
