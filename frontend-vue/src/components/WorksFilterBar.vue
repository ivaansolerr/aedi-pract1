<script setup>
import { reactive, watch } from 'vue';
import { useWorksStore } from '../stores/works';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';

const worksStore = useWorksStore();

const typeOptions = [
  { label: 'Todos los tipos', value: '' },
  { label: 'Película', value: 'movie' },
  { label: 'Serie', value: 'series' },
  { label: 'Libro', value: 'book' }
];

const localFilters = reactive({
  title: worksStore.filters.title || '',
  type: worksStore.filters.type || '',
  genre: worksStore.filters.genre || '',
  release_year: worksStore.filters.release_year || ''
});

// Sincronizar si los filtros del store cambian externamente (ej. reset)
watch(
  () => worksStore.filters,
  (newVal) => {
    localFilters.title = newVal.title || '';
    localFilters.type = newVal.type || '';
    localFilters.genre = newVal.genre || '';
    localFilters.release_year = newVal.release_year || '';
  },
  { deep: true }
);

const handleApplyFilters = () => {
  worksStore.setFilters({ ...localFilters });
};

const handleResetFilters = () => {
  localFilters.title = '';
  localFilters.type = '';
  localFilters.genre = '';
  localFilters.release_year = '';
  worksStore.resetFilters();
};
</script>

<template>
  <div class="filters-card">
    <form @submit.prevent="handleApplyFilters" class="filters-form">
      <div class="filter-field search-title">
        <label for="filter-title" class="field-label">Título</label>
        <span class="p-input-icon-left w-full">
          <i class="pi pi-search input-icon" />
          <InputText
            id="filter-title"
            v-model="localFilters.title"
            placeholder="Buscar por título..."
            class="w-full"
          />
        </span>
      </div>

      <div class="filter-field">
        <label for="filter-type" class="field-label">Tipo de obra</label>
        <Select
          id="filter-type"
          v-model="localFilters.type"
          :options="typeOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Seleccionar tipo"
          class="w-full"
        />
      </div>

      <div class="filter-field">
        <label for="filter-genre" class="field-label">Género</label>
        <InputText
          id="filter-genre"
          v-model="localFilters.genre"
          placeholder="Ej: Drama, Sci-Fi..."
          class="w-full"
        />
      </div>

      <div class="filter-field year-field">
        <label for="filter-year" class="field-label">Año</label>
        <InputText
          id="filter-year"
          v-model="localFilters.release_year"
          placeholder="Ej: 2023"
          class="w-full"
        />
      </div>

      <div class="filter-actions">
        <Button
          type="submit"
          label="Filtrar"
          icon="pi pi-filter"
          :loading="worksStore.isLoading"
          class="action-btn"
        />
        <Button
          type="button"
          label="Limpiar"
          icon="pi pi-filter-slash"
          severity="secondary"
          outlined
          @click="handleResetFilters"
          class="action-btn"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.filters-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.filters-form {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 1rem;
}

.filter-field {
  flex: 1 1 180px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.search-title {
  flex: 2 1 240px;
}

.year-field {
  flex: 1 1 120px;
}

.field-label {
  font-size: 0.825rem;
  font-weight: 600;
  color: #475569;
}

.w-full {
  width: 100%;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.action-btn {
  height: 42px;
}
</style>

