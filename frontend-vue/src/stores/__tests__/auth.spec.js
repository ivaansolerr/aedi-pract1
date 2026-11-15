import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import authService from '../../services/authService';

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicializa con sesión inactiva cuando no hay token previo', () => {
    const store = useAuthStore();
    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(false);
    expect(store.errorMessage).toBeNull();
  });

  it('restaura la sesión desde localStorage al llamar a initializeAuth', () => {
    localStorage.setItem('auth_token', 'token-previo-123');
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ id: 'u1', username: 'Ana', email: 'ana@test.com' })
    );

    const store = useAuthStore();
    store.initializeAuth();

    expect(store.token).toBe('token-previo-123');
    expect(store.user).toEqual({ id: 'u1', username: 'Ana', email: 'ana@test.com' });
    expect(store.isAuthenticated).toBe(true);
  });

  it('login exitoso guarda token y usuario en store y en localStorage', async () => {
    const mockResponse = {
      token: 'jwt-token-valido',
      user: { id: 'u2', username: 'Ana', email: 'ana@test.com' }
    };

    vi.spyOn(authService, 'login').mockResolvedValue(mockResponse);

    const store = useAuthStore();
    const result = await store.login({ email: 'ana@test.com', password: 'password123' });

    expect(result).toEqual(mockResponse);
    expect(store.token).toBe('jwt-token-valido');
    expect(store.user).toEqual(mockResponse.user);
    expect(store.isAuthenticated).toBe(true);
    expect(store.errorMessage).toBeNull();
    expect(localStorage.getItem('auth_token')).toBe('jwt-token-valido');
    expect(JSON.parse(localStorage.getItem('auth_user'))).toEqual(mockResponse.user);
  });

  it('login fallido captura el error, no activa la sesión y asigna errorMessage', async () => {
    const errorResponse = {
      response: {
        status: 401,
        data: { message: 'Credenciales incorrectas.' }
      }
    };

    vi.spyOn(authService, 'login').mockRejectedValue(errorResponse);

    const store = useAuthStore();
    await expect(
      store.login({ email: 'ana@test.com', password: 'wrongpassword' })
    ).rejects.toBeDefined();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.errorMessage).toBe('Credenciales incorrectas.');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('logout limpia el estado reactivo y borra las claves de localStorage', () => {
    localStorage.setItem('auth_token', 'token-activo');
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', username: 'Ana' }));

    const store = useAuthStore();
    store.initializeAuth();
    expect(store.isAuthenticated).toBe(true);

    store.logout();

    expect(store.token).toBeNull();
    expect(store.user).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.errorMessage).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
    expect(localStorage.getItem('auth_user')).toBeNull();
  });
});

