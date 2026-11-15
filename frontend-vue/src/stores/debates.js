import { defineStore } from 'pinia';
import { ref } from 'vue';
import debateService from '../services/debateService';

export const useDebatesStore = defineStore('debates', () => {
  const debates = ref([]);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 5,
    totalPages: 1
  });
  const isLoading = ref(false);
  const errorMessage = ref(null);

  async function fetchDebatesForWork({ workId, page = 1, limit = 5 }) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await debateService.getDebatesByWork({ workId, page, limit });
      debates.value = data.debates || [];
      if (data.pagination) {
        pagination.value = {
          total: Number(data.pagination.total) || 0,
          page: Number(data.pagination.page) || 1,
          limit: Number(data.pagination.limit) || 5,
          totalPages: Number(data.pagination.totalPages) || 1
        };
      }
      return data;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al cargar los debates.';
      debates.value = [];
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function createDebate(workId, { title, description }) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await debateService.createDebateForWork(workId, { title, description });
      // Recargar desde la página 1 para mostrar el debate nuevo y actualizar metadatos
      await fetchDebatesForWork({ workId, page: 1, limit: pagination.value.limit });
      return data.debate;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al crear el debate.';
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteDebate(debateId, workId) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await debateService.deleteDebate(debateId);
      // Eliminar del array local
      debates.value = debates.value.filter((d) => d.id !== debateId);
      pagination.value.total = Math.max(0, pagination.value.total - 1);

      // Si la página quedó vacía y hay páginas anteriores, volver a la anterior
      if (debates.value.length === 0 && pagination.value.page > 1) {
        await fetchDebatesForWork({
          workId,
          page: pagination.value.page - 1,
          limit: pagination.value.limit
        });
      } else if (workId) {
        // Refrescar para rellenar la página con el siguiente elemento
        await fetchDebatesForWork({
          workId,
          page: pagination.value.page,
          limit: pagination.value.limit
        });
      }
      return data;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al eliminar el debate.';
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function setPage(workId, page) {
    pagination.value.page = page;
    return fetchDebatesForWork({ workId, page, limit: pagination.value.limit });
  }

  return {
    debates,
    pagination,
    isLoading,
    errorMessage,
    fetchDebatesForWork,
    createDebate,
    deleteDebate,
    setPage
  };
});

