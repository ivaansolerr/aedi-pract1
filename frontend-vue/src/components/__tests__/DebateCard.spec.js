import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import DebateCard from '../DebateCard.vue';
import { useAuthStore } from '../../stores/auth';

describe('DebateCard.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const sampleDebate = {
    id: 'deb-1',
    user_id: 'user-author-123',
    title: '¿Qué simboliza el monolito?',
    description: 'Análisis detallado sobre el significado filosófico del monolito.',
    created_at: '2024-05-10T12:00:00Z'
  };

  const createWrapper = (debate = sampleDebate) => {
    return mount(DebateCard, {
      props: { debate },
      global: {
        plugins: [PrimeVue, ConfirmationService],
        stubs: {
          Card: {
            template: `
              <div class="p-card">
                <slot name="title"></slot>
                <slot name="subtitle"></slot>
                <slot name="content"></slot>
              </div>
            `
          },
          Button: {
            props: ['label'],
            template: '<button class="p-button">{{ label }}</button>'
          }
        }
      }
    });
  };

  it('renderiza el título, la descripción y la fecha del debate', () => {
    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('¿Qué simboliza el monolito?');
    expect(wrapper.text()).toContain('Análisis detallado sobre el significado');
    expect(wrapper.text()).toContain('Publicado el');
  });

  it('muestra el botón de eliminar si el usuario autenticado es el autor del debate', () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-token';
    authStore.user = { id: 'user-author-123', username: 'Ana' };

    const wrapper = createWrapper();

    expect(wrapper.text()).toContain('Eliminar');
  });

  it('oculta el botón de eliminar si el usuario autenticado NO es el autor del debate', () => {
    const authStore = useAuthStore();
    authStore.token = 'jwt-token';
    authStore.user = { id: 'another-user-999', username: 'Carlos' };

    const wrapper = createWrapper();

    expect(wrapper.text()).not.toContain('Eliminar');
  });

  it('oculta el botón de eliminar a usuarios visitantes (no autenticados)', () => {
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    const wrapper = createWrapper();

    expect(wrapper.text()).not.toContain('Eliminar');
  });
});

