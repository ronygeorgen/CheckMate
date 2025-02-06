import axios from 'axios'
import { store } from '../../redux/store'
import { logoutUser } from '../../redux/features/authSlice'


const api = axios.create({
   baseURL: 'http://localhost:8000/',
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (error.response.status === 401 && error.response.data.detail === 'Token expired' && !originalRequest._retry) {
            originalRequest._retry = true
            try {
                // Call the refresh endpoint

                const refreshResponse = await api.post('/user/refresh-token/')

                // Check if the refresh was successful
                if (refreshResponse.status === 200) {
                    // Retry the original request
                    return api(originalRequest)
                }
            } catch (refreshError) {
                // Handle logout if the refresh fails
                await store.dispatch(logoutUser()).unwrap()
                window.location.href = '/login'
                return Promise.reject(refreshError)
            }
        }
        else{
            console.l
        }

        return Promise.reject(error)
    }
)

export default api


