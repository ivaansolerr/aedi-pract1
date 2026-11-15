<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useWorksStore } from '../stores/works';
import { useToast } from 'primevue/usetoast';

import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';

const route = useRoute();
const router = useRouter();
const worksStore = useWorksStore();
const toast = useToast();

const isEditMode = computed(() => !!route.params.id);
const workId = computed(() => route.params.id);

const form = ref({
  title: '',
  type: 'movie',
  genre: '',
  release_year: '',
  duration: '',
  synopsis: ''
});

const errors = ref({});
const isSubmitting = ref(false);
const formError = ref(null);

const typeOptions = [
  { label: 'Película', value: 'movie' },
  { label: 'Serie', value: 'series' },
  { label: 'Libro', value: 'book' }
];

onMounted(async () => {
  if (isEditMode.value) {
    try {
      const data = await worksStore.fetchWorkById(workId.value);
      if (data) {
        form.value = {
          title: data.title || '',
          type: data.type || 'movie',
          genre: data.genre || '',
          release_year: data.release_year !== undefined ? String(data.release_year) : '',
          duration: data.duration || '',
          synopsis: data.synopsis || ''
        };
      }
    } catch {
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar la obra para editar.',
        life: 3000
      });
      router.push('/works');
    }
  }
});

const validate = () => {
  const errs = {};

  if (!form.value.title.trim()) {
    errs.title = 'El título de la obra es obligatorio.';
  } else if (form.value.title.trim().length < 2) {
    errs.title = 'El título debe tener al menos 2 caracteres.';
  }

  if (!form.value.type) {
    errs.type = 'El tipo de obra es obligatorio.';
  }

  if (!form.value.genre.trim()) {
    errs.genre = 'El género es obligatorio.';
  }

  const yearNum = Number(form.value.release_year);
  if (!form.value.release_year) {
    errs.release_year = 'El año de lanzamiento es obligatorio.';
  } else if (isNaN(yearNum) || yearNum < 1800 || yearNum > 2100) {
    errs.release_year = 'Introduce un año válido entre 1800 y 2100.';
  }

  if (!form.value.duration.trim()) {
    errs.duration = 'La duración o extensión es obligatoria (ej. 120 min, 3 temporadas).';
  }

  if (!form.value.synopsis.trim()) {
    errs.synopsis = 'La sinopsis es obligatoria.';
  } else if (form.value.synopsis.trim().length < 10) {
    errs.synopsis = 'La sinopsis debe tener al menos 10 caracteres.';
  }

  errors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleSubmit = async () => {
  if (!validate()) {
    return;
  }

  isSubmitting.value = true;
  formError.value = null;

  const payload = {
    title: form.value.title.trim(),
    type: form.value.type,
    genre: form.value.genre.trim(),
    release_year: Number(form.value.release_year),
    duration: form.value.duration.trim(),
    synopsis: form.value.synopsis.trim()
  };

  try {
    if (isEditMode.value) {
      await worksStore.updateWork(workId.value, payload);
      toast.add({
        severity: 'success',
        summary: 'Obra actualizada',
        detail: 'Los cambios se han guardado con éxito.',
        life: 3000
      });
      router.push(`/works/${workId.value}`);
    } else {
      const created = await worksStore.createWork(payload);
      toast.add({
        severity: 'success',
        summary: 'Obra creada',
        detail: 'La obra se ha registrado correctamente en el catálogo.',
        life: 3000
      });
      if (created?.id) {
        router.push(`/works/${created.id}`);
      } else {
        router.push('/works');
      }
    }
  } catch (error) {
    formError.value =
      error.response?.data?.message ||
      'Ocurrió un error al guardar la obra. Verifica los datos.';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: formError.value,
      life: 4000
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  if (isEditMode.value) {
    router.push(`/works/${workId.value}`);
  } else {
    router.push('/works');
  }
};
</script>

<template>
  <div class="work-form-page">
    <div class="form-container">
      <Card class="form-card">
        <template #title>
          <div class="form-header">
            <h1 class="header-title">
              {{ isEditMode ? 'Editar Obra' : 'Registrar Nueva Obra' }}
            </h1>
            <p class="header-subtitle">
              {{
                isEditMode
                  ? 'Modifica los datos y características de la obra seleccionada.'
                  : 'Añade una nueva película, serie o libro al catálogo de la plataforma.'
              }}
            </p>
          </div>
        </template>

        <template #content>
          <Message
            v-if="formError"
            severity="error"
            :closable="false"
            class="mb-3"
          >
            {{ formError }}
          </Message>

          <form @submit.prevent="handleSubmit" class="crud-form">
            <div class="field-row">
              <div class="field-item flex-2">
                <label for="work-title" class="field-label">Título de la obra *</label>
                <InputText
                  id="work-title"
                  v-model="form.title"
                  placeholder="Ej: Interestelar, 1984, Breaking Bad"
                  :class="{ 'p-invalid': errors.title }"
                  class="w-full"
                />
                <small v-if="errors.title" class="p-error">{{ errors.title }}</small>
              </div>

              <div class="field-item flex-1">
                <label for="work-type" class="field-label">Tipo de obra *</label>
                <Select
                  id="work-type"
                  v-model="form.type"
                  :options="typeOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Selecciona tipo"
                  :class="{ 'p-invalid': errors.type }"
                  class="w-full"
                />
                <small v-if="errors.type" class="p-error">{{ errors.type }}</small>
              </div>
            </div>

            <div class="field-row">
              <div class="field-item flex-1">
                <label for="work-genre" class="field-label">Género *</label>
                <InputText
                  id="work-genre"
                  v-model="form.genre"
                  placeholder="Ej: Ciencia Ficción, Suspenso"
                  :class="{ 'p-invalid': errors.genre }"
                  class="w-full"
                />
                <small v-if="errors.genre" class="p-error">{{ errors.genre }}</small>
              </div>

              <div class="field-item flex-1">
                <label for="work-year" class="field-label">Año de estreno *</label>
                <InputText
                  id="work-year"
                  v-model="form.release_year"
                  placeholder="Ej: 2014"
                  :class="{ 'p-invalid': errors.release_year }"
                  class="w-full"
                />
                <small v-if="errors.release_year" class="p-error">{{ errors.release_year }}</small>
              </div>

              <div class="field-item flex-1">
                <label for="work-duration" class="field-label">Duración / Extensión *</label>
                <InputText
                  id="work-duration"
                  v-model="form.duration"
                  placeholder="Ej: 169 min, 5 temporadas"
                  :class="{ 'p-invalid': errors.duration }"
                  class="w-full"
                />
                <small v-if="errors.duration" class="p-error">{{ errors.duration }}</small>
              </div>
            </div>

            <div class="field-item">
              <label for="work-synopsis" class="field-label">Sinopsis *</label>
              <Textarea
                id="work-synopsis"
                v-model="form.synopsis"
                rows="5"
                placeholder="Describe la trama principal o argumento sin spoilers..."
                :class="{ 'p-invalid': errors.synopsis }"
                class="w-full"
                autoResize
              />
              <small v-if="errors.synopsis" class="p-error">{{ errors.synopsis }}</small>
            </div>

            <div class="form-actions">
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                @click="handleCancel"
                class="btn-cancel"
              />
              <Button
                type="submit"
                :label="isEditMode ? 'Guardar Cambios' : 'Crear Obra'"
                :icon="isEditMode ? 'pi pi-check' : 'pi pi-plus'"
                :loading="isSubmitting"
                class="btn-submit"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.work-form-page {
  max-width: 800px;
  margin: 2rem auto 4rem auto;
  padding: 0 1.25rem;
}

.form-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.form-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 1rem;
  margin-bottom: 0.5rem;
}

.header-title {
  font-size: 1.65rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.header-subtitle {
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}

.crud-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.field-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.flex-1 {
  flex: 1 1 200px;
}

.flex-2 {
  flex: 2 1 300px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #334155;
}

.w-full {
  width: 100%;
}

.p-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.btn-cancel,
.btn-submit {
  min-width: 130px;
}

.mb-3 {
  margin-bottom: 0.75rem;
}
</style>

