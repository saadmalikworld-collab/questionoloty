import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(cfg => {
  const tok = localStorage.getItem('q_token');
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

API.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('q_token'); localStorage.removeItem('q_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export const login          = d  => API.post('/auth/login', d);
export const getProfile     = () => API.get('/auth/profile');
export const getUsers       = () => API.get('/users');
export const createUser     = d  => API.post('/users', d);
export const updateUser     = (id,d) => API.put(`/users/${id}`, d);
export const deleteUser     = id => API.delete(`/users/${id}`);
export const getCurrencies  = () => API.get('/currencies');
export const updateCurrency = (id,d) => API.put(`/currencies/${id}`, d);
export const getCurrencyLogs= () => API.get('/currencies/logs');
export const getInsurance   = () => API.get('/insurance');
export const createInsurance= d  => API.post('/insurance', d);
export const updateInsurance= (id,d) => API.put(`/insurance/${id}`, d);
export const deleteInsurance= id => API.delete(`/insurance/${id}`);
export const getRoles       = () => API.get('/roles');
export const createRole     = d  => API.post('/roles', d);
export const updateRole     = (id,d) => API.put(`/roles/${id}`, d);
export const deleteRole     = id => API.delete(`/roles/${id}`);
export const getClients     = () => API.get('/clients');
export const createClient   = d  => API.post('/clients', d);
export const updateClient   = (id,d) => API.put(`/clients/${id}`, d);
export const deleteClient   = id => API.delete(`/clients/${id}`);
export const getCountryConfig = country => API.get(`/config/${encodeURIComponent(country)}`);
export const getAllConfigs   = () => API.get('/config');
export const updateConfig   = (id,d) => API.put(`/config/${id}`, d);
export const calculate      = d  => API.post('/calculate', d);

const download = async (url, body, filename) => {
  const res = await API.post(url, body, { responseType: 'blob' });
  const href = window.URL.createObjectURL(new Blob([res.data]));
  const a = Object.assign(document.createElement('a'), { href, download: filename });
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); window.URL.revokeObjectURL(href);
};

export const exportPDF   = body => download('/calculate/export/pdf',   body, `Quoteology_${body.country.replace(/ /g,'_')}.pdf`);
export const exportExcel = body => download('/calculate/export/excel', body, `Quoteology_${body.country.replace(/ /g,'_')}.xlsx`);

export default API;
