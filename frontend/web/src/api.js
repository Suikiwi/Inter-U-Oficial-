import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  const apiKey = localStorage.getItem('api_key');
  if (apiKey) {
    config.headers['X-API-Key'] = apiKey;
  }
  return config;
});

export default api;


{/*   asi se usa
     import api from './api';

api.get('notificaciones/')
  .then(res => console.log(res.data))
  .catch(err => console.error(err));
*/}