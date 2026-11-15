import api from './api';

export const debateService = {
  async getDebatesByWork({ workId, page = 1, limit = 5 }) {
    const params = {
      work_id: workId,
      page,
      limit
    };
    const response = await api.get('/debates', { params });
    return response.data;
  },

  async createDebateForWork(workId, { title, description }) {
    const response = await api.post(`/works/${workId}/debates`, {
      title,
      description
    });
    return response.data;
  },

  async getDebateById(id) {
    const response = await api.get(`/debates/${id}`);
    return response.data;
  },

  async deleteDebate(id) {
    const response = await api.delete(`/debates/${id}`);
    return response.data;
  }
};

export default debateService;

