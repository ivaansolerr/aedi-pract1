import { defineStore } from 'pinia';
import { ref } from 'vue';
import workService from '../services/workService';

export const useWorksStore = defineStore('works', () => {
  const works = ref([]);
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
    pagination,
    filters,
    isLoading,
    errorMessage,
    fetchWorks,
    setPage,
    setFilters,
    resetFilters
  };
});

