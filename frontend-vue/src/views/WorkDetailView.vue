<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorksStore } from '../stores/works';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

import Card from 'primevue/card';
import Tag from 'primevue/tag';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import WorkDebatesSection from '../components/WorkDebatesSection.vue';

const route = useRoute();
const router = useRouter();
const worksStore = useWorksStore();
const authStore = useAuthStore();
const toast = useToast();
const confirm = useConfirm();

const workId = route.params.id;

onMounted(async () => {
  try {
    await worksStore.fetchWorkById(workId);
  } catch {
    // Si la obra no existe, el store establece currentWork = null y se muestra la vista 404
  }
});

const work = computed(() => worksStore.currentWork);

const typeConfig = computed(() => {
  if (!work.value) return { label: 'Obra', severity: 'secondary', icon: 'pi pi-tag' };
  const t = (work.value.type || '').toLowerCase();
  switch (t) {
    case 'movie':
    case 'película':
    case 'pelicula':
      return { label: 'Película', severity: 'info', icon: 'pi pi-video' };
    case 'series':
    case 'serie':
      return { label: 'Serie', severity: 'warn', icon: 'pi pi-desktop' };
    case 'book':
    case 'libro':
      return { label: 'Libro', severity: 'success', icon: 'pi pi-book' };
    default:
      return { label: work.value.type, severity: 'secondary', icon: 'pi pi-tag' };
  }
});

const confirmDelete = () => {
  confirm.require({
    message: `¿Estás seguro de que deseas eliminar permanentemente la obra "${work.value?.title}"? Esta acción no se puede deshacer.`,
    header: 'Confirmar eliminación',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    accept: async () => {
      try {
        await worksStore.deleteWork(workId);
        toast.add({
          severity: 'success',
          summary: 'Obra eliminada',
          detail: 'La obra se ha eliminado correctamente.',
          life: 3000
        });
        router.push('/works');
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Error al eliminar',
          detail: error.response?.data?.message || 'No se pudo eliminar la obra.',
          life: 4000
        });
      }
    }
  });
};
</script>

<template>
  <div class="work-detail-page">
    <!-- Indicador de carga -->
    <div v-if="worksStore.isLoadingDetail" class="loading-state">
      <ProgressSpinner strokeWidth="4" />
      <p class="loading-text">Cargando información de la obra...</p>
    </div>

    <!-- Error / Obra no encontrada -->
    <div v-else-if="!work" class="not-found-state">
      <Card class="not-found-card">
        <template #content>
          <div class="not-found-content">
            <i class="pi pi-exclamation-circle not-found-icon"></i>
            <h2>Obra no encontrada</h2>
            <p>La obra solicitada no existe, ha sido eliminada o el enlace es incorrecto.</p>
            <router-link to="/works">
              <Button label="Volver al catálogo" icon="pi pi-arrow-left" class="mt-3" />
            </router-link>
          </div>
        </template>
      </Card>
    </div>

    <!-- Detalle de la obra -->
    <div v-else class="work-content">
      <nav class="breadcrumb-nav">
        <router-link to="/works" class="back-link">
          <i class="pi pi-arrow-left"></i> Volver al catálogo
        </router-link>
      </nav>

      <Card class="main-card">
        <template #title>
          <div class="header-container">
            <div class="title-section">
              <h1 class="work-title">{{ work.title }}</h1>
              <div class="badges-row">
                <Tag
                  :value="typeConfig.label"
                  :severity="typeConfig.severity"
                  :icon="typeConfig.icon"
                  class="type-tag"
                />
                <span class="meta-tag">
                  <i class="pi pi-bookmark"></i> {{ work.genre }}
                </span>
                <span class="meta-tag">
                  <i class="pi pi-calendar"></i> {{ work.release_year }}
                </span>
                <span class="meta-tag" v-if="work.duration">
                  <i class="pi pi-clock"></i> {{ work.duration }}
                </span>
              </div>
            </div>

            <!-- Botones de gestión para usuarios autenticados -->
            <div v-if="authStore.isAuthenticated" class="actions-section">
              <router-link :to="`/works/${work.id}/edit`">
                <Button
                  label="Editar obra"
                  icon="pi pi-pencil"
                  severity="secondary"
                  outlined
                  size="small"
                />
              </router-link>
              <Button
                label="Eliminar obra"
                icon="pi pi-trash"
                severity="danger"
                outlined
                size="small"
                @click="confirmDelete"
              />
            </div>
          </div>
        </template>

        <template #content>
          <div class="synopsis-section">
            <h3 class="section-title">Sinopsis</h3>
            <p class="synopsis-text">{{ work.synopsis }}</p>
          </div>
        </template>
      </Card>

      <!-- Sección interactiva de debates de la obra -->
      <WorkDebatesSection :work-id="work.id" />
    </div>
  </div>
</template>

<style scoped>
.work-detail-page {
  max-width: 1000px;
  margin: 1.5rem auto 3rem auto;
  padding: 0 1.25rem;
}

.breadcrumb-nav {
  margin-bottom: 1rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #1d4ed8;
}

.main-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.title-section {
  flex: 1 1 500px;
}

.work-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 0.75rem 0;
  line-height: 1.25;
}

.badges-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.type-tag {
  font-size: 0.85rem;
  padding: 0.35rem 0.65rem;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #64748b;
  font-size: 0.9rem;
  background: #f8fafc;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.actions-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.synopsis-section {
  margin-top: 1.5rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.synopsis-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #334155;
  white-space: pre-line;
}

.debates-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.debates-header h2 {
  font-size: 1.35rem;
  color: #0f172a;
  margin: 0;
}

.debates-icon {
  font-size: 1.5rem;
  color: #3b82f6;
}

.debates-info {
  color: #64748b;
  font-size: 0.95rem;
}

.loading-state,
.not-found-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
}

.loading-text {
  margin-top: 1rem;
  color: #64748b;
  font-weight: 500;
}

.not-found-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.not-found-content {
  padding: 1.5rem;
}

.not-found-icon {
  font-size: 3rem;
  color: #ef4444;
  margin-bottom: 1rem;
}

.mt-3 {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>
