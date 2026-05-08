import axios from 'axios'
import Cookies from 'js-cookie'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api',
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('admin_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
