import api from './api';

export const workService = {
  async getWorks(params = {}) {
    const cleanParams = {};

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        cleanParams[key] = value;
      }
    });

    const response = await api.get('/works', { params: cleanParams });
    return response.data;
  },

  async getWorkById(id) {
    const response = await api.get(`/works/${id}`);
    return response.data;
  },

  async createWork(workData) {
    const response = await api.post('/works', workData);
    return response.data;
  },

  async updateWork(id, workData) {
    const response = await api.put(`/works/${id}`, workData);
    return response.data;
  },

  async deleteWork(id) {
    const response = await api.delete(`/works/${id}`);
    return response.data;
  }
};

export default workService;
