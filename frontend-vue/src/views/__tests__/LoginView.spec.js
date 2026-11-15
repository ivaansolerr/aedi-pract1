import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import LoginView from '../LoginView.vue';

// Mock del router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('LoginView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockPush.mockClear();
  });

  const createWrapper = () => {
    return mount(LoginView, {
      global: {
        plugins: [PrimeVue, ToastService],
        stubs: {
          Card: {
            template: '<div class="p-card"><slot name="title"></slot><slot name="content"></slot></div>'
          },
          InputText: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Password: {
            props: ['modelValue'],
            emits: ['update:modelValue'],
            template: '<input type="password" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
          },
          Button: {
            props: ['label', 'loading'],
            template: '<button :disabled="loading">{{ label }}</button>'
          },
          Message: {
            template: '<div class="p-message"><slot></slot></div>'
          }
        }
      }
    });
  };

  it('renderiza correctamente el formulario de inicio de sesión', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Iniciar Sesión');
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Credenciales de prueba');
  });

  it('muestra mensajes de validación al enviar el formulario vacío', async () => {
    const wrapper = createWrapper();
    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('El correo electrónico es obligatorio.');
    expect(wrapper.text()).toContain('La contraseña es obligatoria.');
  });

  it('valida formato de correo incorrecto', async () => {
    const wrapper = createWrapper();
    const emailInput = wrapper.find('input[type="email"]');
    await emailInput.setValue('correo-invalido');

    await wrapper.find('form').trigger('submit.prevent');
    expect(wrapper.text()).toContain('El formato del correo electrónico no es válido.');
  });

  it('el botón de demo completa los campos con las credenciales de prueba', async () => {
    const wrapper = createWrapper();
    const buttons = wrapper.findAll('button');
    const demoButton = buttons.find((btn) => btn.text().includes('Autocompletar datos de prueba'));

    expect(demoButton).toBeDefined();
    await demoButton.trigger('click');

    const emailInput = wrapper.find('input[type="email"]');
    expect(emailInput.element.value).toBe('ana@test.com');
  });
});

