<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();

const handleLogout = () => {
  authStore.logout();
  toast.add({
    severity: 'info',
    summary: 'Sesión finalizada',
    detail: 'Has cerrado sesión correctamente.',
    life: 3000
  });
  router.push('/login');
};
</script>

<template>
  <header class="app-navbar">
    <div class="navbar-container">
      <router-link to="/" class="brand-link">
        <i class="pi pi-comments brand-icon"></i>
        <span class="brand-title">Debates de Ficción</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/" class="nav-item">
          <i class="pi pi-compass"></i> Obras
        </router-link>
      </nav>

      <div class="nav-actions">
        <template v-if="authStore.isAuthenticated">
          <div class="user-info">
            <i class="pi pi-user user-icon"></i>
            <span class="user-name">
              {{ authStore.user?.username || authStore.user?.name || 'Miembro' }}
            </span>
          </div>
          <Button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            severity="secondary"
            size="small"
            outlined
            @click="handleLogout"
          />
        </template>
        <template v-else>
          <router-link to="/login">
            <Button
              label="Iniciar sesión"
              icon="pi pi-sign-in"
              size="small"
            />
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-navbar {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #1e293b;
  font-weight: 700;
  font-size: 1.25rem;
}

.brand-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-item {
  text-decoration: none;
  color: #64748b;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #3b82f6;
  background-color: #eff6ff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: #334155;
  font-weight: 500;
  font-size: 0.95rem;
}

.user-icon {
  background: #e2e8f0;
  padding: 0.35rem;
  border-radius: 50%;
  color: #475569;
}
</style>

