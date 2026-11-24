import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import HomePage from '@/views/HomePage.vue';
import { useAuthStore } from '@/stores/auth';
import { toastController } from '@ionic/vue';

const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}));

describe('HomePage.vue', () => {
  let mockToast: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
    mockReplace.mockClear();

    mockToast = {
      present: vi.fn().mockResolvedValue(undefined),
      dismiss: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(toastController, 'create').mockResolvedValue(mockToast);
  });

  const createWrapper = () => {
    return mount(HomePage, {
      global: {
        stubs: {
          'ion-page': { template: '<div class="ion-page"><slot /></div>' },
          'ion-header': { template: '<header><slot /></header>' },
          'ion-toolbar': { template: '<div><slot /><slot name="end" /></div>' },
          'ion-title': { template: '<h1><slot /></h1>' },
          'ion-content': { template: '<main><slot /></main>' },
          'ion-card': { template: '<div class="ion-card"><slot /></div>' },
          'ion-card-header': { template: '<div class="ion-card-header"><slot /></div>' },
          'ion-card-title': { template: '<h2><slot /></h2>' },
          'ion-card-subtitle': { template: '<h3><slot /></h3>' },
          'ion-card-content': { template: '<div class="ion-card-content"><slot /></div>' },
          'ion-buttons': { template: '<div><slot /></div>' },
          'ion-button': { template: '<button @click="$emit(\'click\')"><slot name="start" /><slot /><slot name="icon-only" /></button>' },
          'ion-icon': { template: '<i />' },
        },
      },
    });
  };

  it('muestra opción de entrar cuando el usuario es visitante', () => {
    const wrapper = createWrapper();
    const loginBtn = wrapper.find('[data-testid="btn-go-login"]');
    expect(loginBtn.exists()).toBe(true);
    expect(wrapper.find('[data-testid="btn-logout"]').exists()).toBe(false);
    expect(wrapper.text()).toContain('Modo visitante');
  });

  it('muestra perfil y opción de cerrar sesión cuando el usuario está autenticado', () => {
    const authStore = useAuthStore();
    authStore.token = 'valid-jwt';
    authStore.user = { id: 'u1', username: 'Ana', email: 'ana@test.com' };

    const wrapper = createWrapper();
    const logoutBtn = wrapper.find('[data-testid="btn-logout"]');
    expect(logoutBtn.exists()).toBe(true);
    expect(wrapper.find('[data-testid="btn-user-profile"]').text()).toContain('Ana');
    expect(wrapper.text()).toContain('Sesión activa');
  });

  it('ejecuta logout, emite toast y redirige a /login con replace al pulsar cerrar sesión', async () => {
    const authStore = useAuthStore();
    authStore.token = 'valid-jwt';
    authStore.user = { id: 'u1', username: 'Ana', email: 'ana@test.com' };

    const wrapper = createWrapper();
    const logoutBtn = wrapper.find('[data-testid="btn-logout"]');
    await logoutBtn.trigger('click');

    expect(authStore.isAuthenticated).toBe(false);
    expect(authStore.token).toBeNull();
    expect(toastController.create).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/login');
  });
});
