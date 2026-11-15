<script setup>
import { useAuthStore } from '../stores/auth';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Message from 'primevue/message';

const authStore = useAuthStore();
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h1 class="hero-title">Debates de Ficción</h1>
      <p class="hero-subtitle">
        El punto de encuentro para debatir sobre películas, series y libros.
      </p>

      <div class="user-status-card">
        <Card>
          <template #title>
            <div class="status-header">
              <i class="pi pi-user-check" v-if="authStore.isAuthenticated"></i>
              <i class="pi pi-info-circle" v-else></i>
              <span>Estado de la sesión</span>
            </div>
          </template>
          <template #content>
            <div v-if="authStore.isAuthenticated" class="auth-welcome">
              <p>
                ¡Hola de nuevo, <strong>{{ authStore.user?.username || authStore.user?.name }}</strong>! Has iniciado sesión correctamente con el correo <code>{{ authStore.user?.email }}</code>.
              </p>
              <Message severity="success" :closable="false" class="mt-3">
                Tu sesión está activa y persistida en el navegador.
              </Message>
            </div>
            <div v-else class="guest-welcome">
              <p>
                Actualmente estás navegando como <strong>visitante</strong>. Puedes explorar el contenido público o iniciar sesión con una cuenta para participar.
              </p>
              <div class="mt-3">
                <router-link to="/login">
                  <Button label="Ir a Iniciar Sesión" icon="pi pi-sign-in" />
                </router-link>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <div class="next-iteration-preview mt-4">
        <Card>
          <template #title>
            <div class="status-header">
              <i class="pi pi-book"></i>
              <span>Catálogo de Obras</span>
            </div>
          </template>
          <template #content>
            <p>
              El catálogo completo con búsqueda en tiempo real, filtros avanzados y paginación se integrará en la <strong>Iteración 12</strong>.
            </p>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 900px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.hero-section {
  text-align: center;
}

.hero-title {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #64748b;
  margin-bottom: 2rem;
}

.user-status-card,
.next-iteration-preview {
  text-align: left;
}

.status-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #1e293b;
}

.auth-welcome code {
  background: #f1f5f9;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  color: #2563eb;
}

.guest-welcome {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mt-3 {
  margin-top: 0.75rem;
}

.mt-4 {
  margin-top: 1rem;
}
</style>

