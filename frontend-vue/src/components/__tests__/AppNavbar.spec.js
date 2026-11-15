import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import AppNavbar from '../AppNavbar.vue';
import { useAuthStore } from '../../stores/auth';

const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}));

describe('AppNavbar.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    mockPush.mockClear();
  });

  const createWrapper = () => {
    return mount(AppNavbar, {
      global: {
        plugins: [PrimeVue, ToastService],
        stubs: {
          'router-link': {
            props: ['to'],
            template: '<a :href="to"><slot></slot></a>'
          },
          Button: {
            props: ['label'],
            template: '<button @click="$emit(\'click\')">{{ label }}</button>'
          }
        }
      }
    });
  };

  it('muestra el enlace a Iniciar sesión cuando no hay usuario autenticado', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Debates de Ficción');
    expect(wrapper.text()).toContain('Iniciar sesión');
    expect(wrapper.text()).not.toContain('Cerrar sesión');
  });

  it('muestra el nombre del usuario y el botón de Cerrar sesión cuando está autenticado', async () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-activo';
    authStore.user = { id: 'u1', username: 'Ana', email: 'ana@test.com' };

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Ana');
    expect(wrapper.text()).toContain('Cerrar sesión');
    expect(wrapper.text()).not.toContain('Iniciar sesión');
  });

  it('cerrar sesión limpia el store y redirige al login', async () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-activo';
    authStore.user = { id: 'u1', username: 'Ana' };

    const wrapper = createWrapper();
    const logoutBtn = wrapper.findAll('button').find((b) => b.text().includes('Cerrar sesión'));

    await logoutBtn.trigger('click');

    expect(authStore.isAuthenticated).toBe(false);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});

