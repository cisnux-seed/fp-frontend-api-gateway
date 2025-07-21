import axios, { type InternalAxiosRequestConfig } from 'axios';

const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Jangan tambahkan token untuk endpoint registrasi dan login
    if (config.url?.includes('/api/auth/register') || config.url?.includes('/api/auth/login')) {
      return config;
    }

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani response (misalnya, refresh token)
// Untuk saat ini, kita hanya akan meneruskan respons atau error
apiService.interceptors.response.use(
  (response) => {
    // Mengembalikan data di dalam wrapper 'data' sesuai struktur OpenAPI
    return response.data;
  },
  (error) => {
    // Jika ada error dari API, kembalikan pesan error di dalam 'error.response.data'
    // Ini membantu kita menampilkan pesan error yang relevan di UI
    if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

export default apiService;
