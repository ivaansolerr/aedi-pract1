<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useConfirm } from 'primevue/useconfirm';
import Card from 'primevue/card';
import Button from 'primevue/button';

const props = defineProps({
  debate: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['delete']);

const authStore = useAuthStore();
const confirm = useConfirm();

const canDelete = computed(() => {
  if (!authStore.isAuthenticated || !authStore.user?.id) {
    return false;
  }
  return authStore.user.id === props.debate.user_id;
});

const formattedDate = computed(() => {
  if (!props.debate.created_at) return '';
  try {
    const d = new Date(props.debate.created_at);
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
});

const handleDelete = () => {
  confirm.require({
    message: `¿Deseas eliminar definitivamente el debate "${props.debate.title}"?`,
    header: 'Confirmar eliminación de debate',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    acceptLabel: 'Eliminar',
    rejectLabel: 'Cancelar',
    accept: () => {
      emit('delete', props.debate.id);
    }
  });
};
</script>

<template>
  <Card class="debate-card">
    <template #title>
      <div class="debate-header">
        <h4 class="debate-title">{{ debate.title }}</h4>
        <Button
          v-if="canDelete"
          icon="pi pi-trash"
          label="Eliminar"
          severity="danger"
          size="small"
          text
          @click="handleDelete"
          class="delete-btn"
        />
      </div>
    </template>

    <template #subtitle>
      <div class="debate-meta" v-if="formattedDate">
        <i class="pi pi-clock"></i>
        <span>Publicado el {{ formattedDate }}</span>
      </div>
    </template>

    <template #content>
      <p class="debate-desc">{{ debate.description }}</p>
    </template>
  </Card>
</template>

<style scoped>
.debate-card {
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  background: #ffffff;
  transition: all 0.2s ease;
}

.debate-card:hover {
  border-color: #cbd5e1;
}

.debate-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
}

.debate-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.35;
}

.debate-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #64748b;
  margin-top: 0.2rem;
}

.debate-desc {
  color: #334155;
  font-size: 0.95rem;
  line-height: 1.6;
  white-space: pre-line;
  margin-top: 0.5rem;
}

.delete-btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}
</style>

