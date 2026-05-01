export const API_URL = import.meta.env.VITE_API_URL || 'https://swiftflow-backend.onrender.com';
export const getToken = () => localStorage.getItem('sf_token');
