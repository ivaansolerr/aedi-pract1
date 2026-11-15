import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../api';
import authService from '../authService';

describe('authService y api client', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('authService.login llama a POST /auth/login con credenciales', async () => {
    const mockData = {
      token: 'jwt-123',
      user: { id: 'u1', username: 'Ana' }
    };
    vi.spyOn(api, 'post').mockResolvedValue({ data: mockData });

    const result = await authService.login({ email: 'ana@test.com', password: 'password123' });

    expect(api.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ana@test.com',
      password: 'password123'
    });
    expect(result).toEqual(mockData);
  });

  it('authService.getProfile llama a GET /auth/me', async () => {
    const mockProfile = {
      user: { id: 'u1', username: 'Ana', email: 'ana@test.com' }
    };
    vi.spyOn(api, 'get').mockResolvedValue({ data: mockProfile });

    const result = await authService.getProfile();

    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockProfile);
  });

  it('el interceptor de api inyecta Authorization: Bearer cuando hay token en localStorage', () => {
    localStorage.setItem('auth_token', 'mi-token-secreto');

    // Comprobamos la función interceptora directamente registrada
    const requestInterceptor = api.interceptors.request.handlers[0]?.fulfilled;
    expect(requestInterceptor).toBeDefined();

    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer mi-token-secreto');
  });

  it('el interceptor de api no añade Authorization si no hay token en localStorage', () => {
    const requestInterceptor = api.interceptors.request.handlers[0]?.fulfilled;
    expect(requestInterceptor).toBeDefined();

    const config = { headers: {} };
    const modifiedConfig = requestInterceptor(config);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });
});

