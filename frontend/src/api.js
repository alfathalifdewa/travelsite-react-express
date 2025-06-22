// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://travelsite-react-express-n1kx38w2o-mataelangs-projects.vercel.app',
  headers: {
    'Content-Type': 'application/json',
  },
});

const token = localStorage.getItem('authToken');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token};Basic U0ItTWlkLXNlcnZlci0xVWgwZjJSLUhPb3pLTlBnczMwcjRVUGs=`;
}

export default api;
