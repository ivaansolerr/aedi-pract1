import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import LoginPage from '@/views/LoginPage.vue';
import { useAuthStore } from '@/stores/auth';
import { toastController } from '@ionic/vue';

const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe('LoginPage.vue', () => {
  let mockToast: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
    mockPush.mockClear();
    mockReplace.mockClear();

    mockToast = {
      present: vi.fn().mockResolvedValue(undefined),
      dismiss: vi.fn().mockResolvedValue(undefined),
    };
    vi.spyOn(toastController, 'create').mockResolvedValue(mockToast);
  });

  const createWrapper = () => {
    return mount(LoginPage, {
      global: {
        stubs: {
          'ion-page': { template: '<div class="ion-page"><slot /></div>' },
          'ion-header': { template: '<header><slot /></header>' },
          'ion-toolbar': { template: '<div><slot name="start" /><slot /><slot name="end" /></div>' },
          'ion-title': { template: '<h1><slot /></h1>' },
          'ion-content': { template: '<main><slot /></main>' },
          'ion-card': { template: '<div class="ion-card"><slot /></div>' },
          'ion-card-header': { template: '<div class="ion-card-header"><slot /></div>' },
          'ion-card-title': { template: '<div class="ion-card-title"><slot /></div>' },
          'ion-card-subtitle': { template: '<div class="ion-card-subtitle"><slot /></div>' },
          'ion-card-content': { template: '<div class="ion-card-content"><slot /></div>' },
          'ion-list': { template: '<div class="ion-list"><slot /></div>' },
          'ion-item': { template: '<div class="ion-item"><slot /><slot name="error" /></div>' },
          'ion-input': {
            props: ['modelValue', 'type', 'inputmode', 'label'],
            emits: ['update:modelValue', 'ion-input'],
            template: '<input :value="modelValue" :type="type" :inputmode="inputmode" @input="$emit(\'update:modelValue\', $event.target.value); $emit(\'ion-input\', $event)" />',
          },
          'ion-note': { template: '<span class="ion-note"><slot /></span>' },
          'ion-button': { template: '<button :disabled="$attrs.disabled"><slot /></button>' },
          'ion-spinner': { template: '<span class="spinner" />' },
          'ion-buttons': { template: '<div><slot /></div>' },
          'ion-back-button': { template: '<button>Atrás</button>' },
        },
      },
    });
  };

  it('renderiza el formulario con atributos de teclado adaptados a móvil', () => {
    const wrapper = createWrapper();
    const emailInput = wrapper.find('[data-testid="login-email"]');
    const passwordInput = wrapper.find('[data-testid="login-password"]');

    expect(emailInput.exists()).toBe(true);
    expect(emailInput.attributes('type')).toBe('email');
    expect(emailInput.attributes('inputmode')).toBe('email');

    expect(passwordInput.exists()).toBe(true);
    expect(passwordInput.attributes('type')).toBe('password');
  });

  it('muestra errores de validación si se envía el formulario con campos vacíos', async () => {
    const wrapper = createWrapper();
    const authStore = useAuthStore();
    const loginSpy = vi.spyOn(authStore, 'login');

    await wrapper.find('form').trigger('submit.prevent');

    expect(loginSpy).not.toHaveBeenCalled();
    const errorEmail = wrapper.find('[data-testid="error-email"]');
    const errorPassword = wrapper.find('[data-testid="error-password"]');

    expect(errorEmail.exists()).toBe(true);
    expect(errorEmail.text()).toContain('correo electrónico es obligatorio');
    expect(errorPassword.exists()).toBe(true);
    expect(errorPassword.text()).toContain('contraseña es obligatoria');
  });

  it('muestra error de validación cuando el formato del email no es válido', async () => {
    const wrapper = createWrapper();
    const authStore = useAuthStore();
    const loginSpy = vi.spyOn(authStore, 'login');

    await wrapper.find('[data-testid="login-email"]').setValue('correo-invalido');
    await wrapper.find('[data-testid="login-password"]').setValue('123456');

    await wrapper.find('form').trigger('submit.prevent');

    expect(loginSpy).not.toHaveBeenCalled();
    const errorEmail = wrapper.find('[data-testid="error-email"]');
    expect(errorEmail.exists()).toBe(true);
    expect(errorEmail.text()).toContain('formato del correo electrónico no es válido');
  });

  it('autocompleta credenciales de prueba al hacer clic en el botón demo', async () => {
    const wrapper = createWrapper();
    const demoButton = wrapper.find('[data-testid="btn-demo-credentials"]');

    await demoButton.trigger('click');

    const emailInput = wrapper.find<HTMLInputElement>('[data-testid="login-email"]');
    const passwordInput = wrapper.find<HTMLInputElement>('[data-testid="login-password"]');

    expect(emailInput.element.value).toBe('ana@test.com');
    expect(passwordInput.element.value).toBe('12345678');
  });

  it('muestra toast de éxito y redirige a /home tras login exitoso', async () => {
    const wrapper = createWrapper();
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockResolvedValue({
      token: 'jwt-123',
      user: { id: 'u1', username: 'Ana', email: 'ana@test.com' },
    });

    await wrapper.find('[data-testid="btn-demo-credentials"]').trigger('click');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(authStore.login).toHaveBeenCalledWith({
      email: 'ana@test.com',
      password: '12345678',
    });
    expect(toastController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'success',
        message: expect.stringContaining('Bienvenido'),
      })
    );
    expect(mockToast.present).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/home');
  });

  it('muestra toast de error con color danger cuando el login falla', async () => {
    const wrapper = createWrapper();
    const authStore = useAuthStore();
    vi.spyOn(authStore, 'login').mockRejectedValue({
      response: { data: { message: 'Credenciales inválidas.' } },
    });

    await wrapper.find('[data-testid="btn-demo-credentials"]').trigger('click');
    await wrapper.find('form').trigger('submit.prevent');
    await flushPromises();

    expect(toastController.create).toHaveBeenCalledWith(
      expect.objectContaining({
        color: 'danger',
        message: 'Credenciales inválidas.',
      })
    );
    expect(mockToast.present).toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
