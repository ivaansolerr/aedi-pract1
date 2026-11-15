<script setup>
import { ref, onMounted } from 'vue';
import { useDebatesStore } from '../stores/debates';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'primevue/usetoast';

import DebateCard from './DebateCard.vue';
import Card from 'primevue/card';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Paginator from 'primevue/paginator';
import ProgressSpinner from 'primevue/progressspinner';

const props = defineProps({
  workId: {
    type: String,
    required: true
  }
});

const debatesStore = useDebatesStore();
const authStore = useAuthStore();
const toast = useToast();

const newTitle = ref('');
const newDescription = ref('');
const formErrors = ref({});
const isSubmitting = ref(false);

onMounted(() => {
  debatesStore.fetchDebatesForWork({ workId: props.workId, page: 1, limit: 5 });
});

const validateForm = () => {
  const errs = {};
  if (!newTitle.value.trim()) {
    errs.title = 'El título del debate es obligatorio.';
  } else if (newTitle.value.trim().length < 3) {
    errs.title = 'El título debe tener al menos 3 caracteres.';
  }

  if (!newDescription.value.trim()) {
    errs.description = 'La descripción es obligatoria.';
  } else if (newDescription.value.trim().length < 5) {
    errs.description = 'La descripción debe tener al menos 5 caracteres.';
  }

  formErrors.value = errs;
  return Object.keys(errs).length === 0;
};

const handleCreateDebate = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    await debatesStore.createDebate(props.workId, {
      title: newTitle.value.trim(),
      description: newDescription.value.trim()
    });

    toast.add({
      severity: 'success',
      summary: 'Debate publicado',
      detail: 'Tu debate se ha añadido a la conversación.',
      life: 3000
    });

    newTitle.value = '';
    newDescription.value = '';
    formErrors.value = {};
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al publicar debate',
      detail: error.response?.data?.message || 'No se pudo crear el debate.',
      life: 4000
    });
  } finally {
    isSubmitting.value = false;
  }
};

const handleDeleteDebate = async (debateId) => {
  try {
    await debatesStore.deleteDebate(debateId, props.workId);
    toast.add({
      severity: 'success',
      summary: 'Debate eliminado',
      detail: 'El debate ha sido eliminado correctamente.',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error al eliminar',
      detail: error.response?.data?.message || 'No se pudo eliminar el debate.',
      life: 4000
    });
  }
};

const handlePageChange = (event) => {
  const newPage = event.page + 1;
  debatesStore.setPage(props.workId, newPage);
};
</script>

<template>
  <div class="debates-section">
    <div class="section-header">
      <div class="header-left">
        <i class="pi pi-comments section-icon"></i>
        <h2 class="section-title">Debates de la comunidad</h2>
      </div>
      <span
        v-if="!debatesStore.isLoading && debatesStore.pagination.total > 0"
        class="debates-count"
      >
        {{ debatesStore.pagination.total }}
        {{ debatesStore.pagination.total === 1 ? 'debate abierto' : 'debates abiertos' }}
      </span>
    </div>

    <!-- Formulario para crear debate (solo usuarios autenticados) -->
    <div v-if="authStore.isAuthenticated" class="new-debate-card mb-4">
      <Card>
        <template #title>
          <div class="new-debate-title">
            <i class="pi pi-plus-circle"></i>
            <h3>Iniciar un nuevo debate</h3>
          </div>
        </template>
        <template #content>
          <form @submit.prevent="handleCreateDebate" class="debate-form">
            <div class="form-field">
              <label for="debate-title" class="field-label">Título del debate *</label>
              <InputText
                id="debate-title"
                v-model="newTitle"
                placeholder="Ej: ¿Qué opináis del final? o Teorías sobre el protagonista..."
                :class="{ 'p-invalid': formErrors.title }"
                class="w-full"
              />
              <small v-if="formErrors.title" class="p-error">{{ formErrors.title }}</small>
            </div>

            <div class="form-field">
              <label for="debate-desc" class="field-label">Descripción o argumento *</label>
              <Textarea
                id="debate-desc"
                v-model="newDescription"
                rows="3"
                placeholder="Expón tu opinión, plantea preguntas o argumentos para debatir con la comunidad..."
                :class="{ 'p-invalid': formErrors.description }"
                class="w-full"
                autoResize
              />
              <small v-if="formErrors.description" class="p-error">{{ formErrors.description }}</small>
            </div>

            <div class="form-actions">
              <Button
                type="submit"
                label="Publicar Debate"
                icon="pi pi-send"
                :loading="isSubmitting"
                class="submit-btn"
              />
            </div>
          </form>
        </template>
      </Card>
    </div>

    <!-- Invitación a iniciar sesión para visitantes -->
    <div v-else class="guest-banner mb-4">
      <Message severity="info" :closable="false">
        <div class="guest-content">
          <span>Inicia sesión con tu cuenta para participar y abrir nuevos debates sobre esta obra.</span>
          <router-link to="/login">
            <Button label="Iniciar Sesión" icon="pi pi-sign-in" size="small" class="ml-2" />
          </router-link>
        </div>
      </Message>
    </div>

    <!-- Indicador de carga -->
    <div v-if="debatesStore.isLoading" class="loading-debates">
      <ProgressSpinner strokeWidth="4" />
      <p class="loading-text">Cargando debates...</p>
    </div>

    <!-- Lista de debates -->
    <div v-else-if="debatesStore.debates.length > 0" class="debates-list">
      <DebateCard
        v-for="debate in debatesStore.debates"
        :key="debate.id"
        :debate="debate"
        @delete="handleDeleteDebate"
      />
    </div>

    <!-- Estado vacío -->
    <div v-else class="empty-debates">
      <div class="empty-box">
        <i class="pi pi-comment empty-icon"></i>
        <h4>No hay debates abiertos todavía</h4>
        <p>Esta obra aún no tiene hilos de discusión. ¡Sé el primero en iniciar un debate!</p>
      </div>
    </div>

    <!-- Paginador server-side de debates -->
    <div
      v-if="debatesStore.pagination.total > debatesStore.pagination.limit"
      class="paginator-wrapper mt-3"
    >
      <Paginator
        :rows="debatesStore.pagination.limit"
        :totalRecords="debatesStore.pagination.total"
        :first="(debatesStore.pagination.page - 1) * debatesStore.pagination.limit"
        @page="handlePageChange"
        template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
      />
    </div>
  </div>
</template>

<style scoped>
.debates-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  font-size: 1.6rem;
  color: #3b82f6;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.debates-count {
  font-size: 0.85rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.3rem 0.65rem;
  border-radius: 20px;
  font-weight: 600;
}

.new-debate-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 1.1rem;
  color: #1e293b;
}

.new-debate-title h3 {
  margin: 0;
  font-size: 1.1rem;
}

.debate-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.guest-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.debates-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-debates {
  background: #ffffff;
  border: 1px dashed #cbd5e1;
  border-radius: 10px;
  padding: 2.5rem 1rem;
  text-align: center;
}

.empty-icon {
  font-size: 2.5rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.empty-box h4 {
  font-size: 1.15rem;
  color: #1e293b;
  margin-bottom: 0.35rem;
}

.empty-box p {
  color: #64748b;
  font-size: 0.9rem;
}

.loading-debates {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1rem;
}

.loading-text {
  color: #64748b;
  margin-top: 0.75rem;
  font-size: 0.9rem;
}

.paginator-wrapper {
  display: flex;
  justify-content: center;
}

.w-full {
  width: 100%;
}

.p-error {
  color: #ef4444;
  font-size: 0.8rem;
}

.mb-4 {
  margin-bottom: 1.25rem;
}

.mt-3 {
  margin-top: 1rem;
}

.ml-2 {
  margin-left: 0.5rem;
}
</style>

