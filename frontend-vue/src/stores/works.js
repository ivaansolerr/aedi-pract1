import { defineStore } from 'pinia';
import { ref } from 'vue';
import workService from '../services/workService';

export const useWorksStore = defineStore('works', () => {
  const works = ref([]);
  const currentWork = ref(null);
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 6,
    totalPages: 1
  });
  const filters = ref({
    title: '',
    type: '',
    genre: '',
    release_year: ''
  });
  const isLoading = ref(false);
  const isLoadingDetail = ref(false);
  const errorMessage = ref(null);

  async function fetchWorks(options = {}) {
    isLoading.value = true;
    errorMessage.value = null;

    const requestParams = {
      title: filters.value.title,
      type: filters.value.type,
      genre: filters.value.genre,
      release_year: filters.value.release_year,
      page: pagination.value.page,
      limit: pagination.value.limit,
      ...options
    };

    try {
      const data = await workService.getWorks(requestParams);
      works.value = data.works || [];
      if (data.pagination) {
        pagination.value = {
          total: Number(data.pagination.total) || 0,
          page: Number(data.pagination.page) || 1,
          limit: Number(data.pagination.limit) || 6,
          totalPages: Number(data.pagination.totalPages) || 1
        };
      }
      return data;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al obtener el catálogo de obras.';
      works.value = [];
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchWorkById(id) {
    isLoadingDetail.value = true;
    errorMessage.value = null;
    try {
      const data = await workService.getWorkById(id);
      currentWork.value = data.work || null;
      return data.work;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al obtener la obra solicitada.';
      currentWork.value = null;
      throw error;
    } finally {
      isLoadingDetail.value = false;
    }
  }

  async function createWork(workData) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await workService.createWork(workData);
      return data.work;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al crear la obra.';
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateWork(id, workData) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await workService.updateWork(id, workData);
      if (currentWork.value && currentWork.value.id === id) {
        currentWork.value = { ...currentWork.value, ...data.work };
      }
      return data.work;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al actualizar la obra.';
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteWork(id) {
    isLoading.value = true;
    errorMessage.value = null;
    try {
      const data = await workService.deleteWork(id);
      if (currentWork.value && currentWork.value.id === id) {
        currentWork.value = null;
      }
      works.value = works.value.filter((w) => w.id !== id);
      return data;
    } catch (error) {
      errorMessage.value =
        error.response?.data?.message || error.message || 'Error al eliminar la obra.';
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function setPage(page) {
    pagination.value.page = page;
    return fetchWorks({ page });
  }

  async function setFilters(newFilters) {
    filters.value = {
      ...filters.value,
      ...newFilters
    };
    pagination.value.page = 1;
    return fetchWorks({ page: 1 });
  }

  async function resetFilters() {
    filters.value = {
      title: '',
      type: '',
      genre: '',
      release_year: ''
    };
    pagination.value.page = 1;
    return fetchWorks({ page: 1 });
  }

  return {
    works,
    currentWork,
    pagination,
    filters,
    isLoading,
    isLoadingDetail,
    errorMessage,
    fetchWorks,
    fetchWorkById,
    createWork,
    updateWork,
    deleteWork,
    setPage,
    setFilters,
    resetFilters
  };
});
