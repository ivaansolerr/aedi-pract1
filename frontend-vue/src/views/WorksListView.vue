<script setup>
import { onMounted } from 'vue';
import { useWorksStore } from '../stores/works';
import { useAuthStore } from '../stores/auth';
import WorksFilterBar from '../components/WorksFilterBar.vue';
import WorkCard from '../components/WorkCard.vue';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';
import Message from 'primevue/message';
import Button from 'primevue/button';

const worksStore = useWorksStore();
const authStore = useAuthStore();

onMounted(() => {
  // Carga inicial solo si no se han cargado obras previamente
  if (worksStore.works.length === 0) {
    worksStore.fetchWorks();
  }
});

const handlePageChange = (event) => {
  const newPage = event.page + 1;
  worksStore.setPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
  <div class="catalog-page">
    <div class="catalog-header">
      <div>
        <h1 class="page-title">Catálogo de Obras</h1>
        <p class="page-subtitle">
          Explora películas, series y libros, y participa en los debates de la comunidad.
        </p>
      </div>

      <div class="header-right">
        <div v-if="!worksStore.isLoading && worksStore.pagination.total > 0" class="results-badge">
          <i class="pi pi-check-circle"></i>
          <span>{{ worksStore.pagination.total }} obras encontradas</span>
        </div>

        <router-link v-if="authStore.isAuthenticated" to="/works/new">
          <Button
            label="Crear Obra"
            icon="pi pi-plus"
            severity="primary"
          />
        </router-link>
      </div>
    </div>

    <!-- Barra de filtros y búsqueda -->
    <WorksFilterBar />

    <!-- Mensaje de error si falla la carga -->
    <Message
      v-if="worksStore.errorMessage"
      severity="error"
      :closable="false"
      class="mb-4"
    >
      {{ worksStore.errorMessage }}
    </Message>

    <!-- Indicador de carga -->
    <div v-if="worksStore.isLoading" class="loading-container">
      <ProgressSpinner strokeWidth="4" />
      <p class="loading-text">Cargando catálogo de obras...</p>
    </div>

    <!-- Grid de tarjetas de obras -->
    <div
      v-else-if="worksStore.works.length > 0"
      class="works-grid"
    >
      <WorkCard
        v-for="work in worksStore.works"
        :key="work.id"
        :work="work"
      />
    </div>

    <!-- Estado vacío -->
    <div
      v-else-if="!worksStore.isLoading && worksStore.works.length === 0"
      class="empty-state"
    >
      <div class="empty-content">
        <i class="pi pi-search-minus empty-icon"></i>
        <h3 class="empty-title">No se encontraron obras</h3>
        <p class="empty-desc">
          No hay títulos que coincidan con los criterios de búsqueda o filtros seleccionados.
        </p>
        <Button
          label="Limpiar filtros"
          icon="pi pi-filter-slash"
          severity="primary"
          @click="worksStore.resetFilters"
        />
      </div>
    </div>

    <!-- Paginador server-side conectado al backend -->
    <div
      v-if="worksStore.pagination.total > worksStore.pagination.limit"
      class="paginator-container"
    >
      <Paginator
        :rows="worksStore.pagination.limit"
        :totalRecords="worksStore.pagination.total"
        :first="(worksStore.pagination.page - 1) * worksStore.pagination.limit"
        @page="handlePageChange"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      />
    </div>
  </div>
</template>

<style scoped>
.catalog-page {
  max-width: 1200px;
  margin: 1.5rem auto 3rem auto;
  padding: 0 1.25rem;
}

.catalog-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title {
  font-size: 1.85rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin-top: 0.25rem;
  font-size: 0.95rem;
}

.results-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #f1f5f9;
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
}

.results-badge i {
  color: #10b981;
}

.works-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.loading-container {
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

.empty-state {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 3rem;
  color: #94a3b8;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.paginator-container {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>
