<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import AppNavbar from './components/AppNavbar.vue';
import Toast from 'primevue/toast';

const authStore = useAuthStore();

onMounted(() => {
  // Inicializar auth para restaurar sesión activa si existe
  authStore.initializeAuth();
});
</script>

<template>
  <div class="app-layout">
    <Toast position="top-right" />
    <AppNavbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
/* Estilos globales y reset mínimo */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>

