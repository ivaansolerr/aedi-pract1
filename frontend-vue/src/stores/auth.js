import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('auth_token') || null);
  
  let initialUser = null;
  try {
    const rawUser = localStorage.getItem('auth_user');
    if (rawUser) {
      initialUser = JSON.parse(rawUser);
    }
  } catch {
    initialUser = null;
  }
  const user = ref(initialUser);
  const isLoading = ref(false);
  const errorMessage = ref(null);

  const isAuthenticated = computed(() => !!token.value);

  function initializeAuth() {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken) {
      token.value = storedToken;
      try {
        user.value = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        user.value = null;
      }
    } else {
      token.value = null;
      user.value = null;
    }
  }

  async function login({ email, password }) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await authService.login({ email, password });
      token.value = data.token;
      user.value = data.user;
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al iniciar sesión.';
      errorMessage.value = message;
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    errorMessage.value = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  async function fetchCurrentUser() {
    if (!token.value) return null;
    try {
      const data = await authService.getProfile();
      user.value = data.user;
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      return data.user;
    } catch (error) {
      logout();
      throw error;
    }
  }

  return {
    token,
    user,
    isLoading,
    errorMessage,
    isAuthenticated,
    initializeAuth,
    login,
    logout,
    fetchCurrentUser
  };
});

