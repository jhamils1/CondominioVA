import axios from 'axios';
export default {
  get(url, config) {
    return this.create({}).get(url, config);
  },
  create(config) {
    const baseURL = (config.baseURL || 'http://127.0.0.1:8000/api/').replace(/\/?$/, '/');
    const client = axios.create({ ...config, baseURL });
    client.interceptors.response.use(response => response, error => {
      if (error.response?.status === 403) window.dispatchEvent(new Event('api-forbidden'));
      return Promise.reject(error);
    });
    return client;
  },
};
